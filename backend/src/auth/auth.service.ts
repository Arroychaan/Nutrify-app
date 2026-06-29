import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema.js';
import { users } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { hashPassword, comparePasswords } from '../utils/password.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private generateTokens(userId: string, email: string) {
    const payload = { userId, email };

    // Load config expiration times, defaulting if not specified
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'dev-secret-key',
      expiresIn: (this.configService.get<string>('JWT_EXPIRE_TIME') ||
        '24h') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
        'dev-refresh-secret',
      expiresIn: (this.configService.get<string>('REFRESH_TOKEN_EXPIRE_TIME') ||
        '7d') as any,
    });

    return { accessToken, refreshToken };
  }

  async register(body: any) {
    const {
      email,
      password,
      fullName,
      heightCm,
      currentWeightKg,
      gender,
      dateOfBirth,
      activityLevel,
    } = body;

    if (!email || !password || !fullName) {
      throw new BadRequestException(
        'Email, password, and full name are required',
      );
    }

    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const heightDecimal = heightCm ? heightCm.toString() : '0.00';
    const weightDecimal = currentWeightKg ? currentWeightKg.toString() : '0.00';

    const [user] = await this.db
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
        fullName,
        heightCm: heightDecimal,
        currentWeightKg: weightDecimal,
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        activityLevel: activityLevel || 'moderate',
        isVerified: true, // Auto-verified for now like in Express app
        verificationToken,
        verificationExpires,
      })
      .returning();

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
    );

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      accessToken,
      refreshToken,
      expiresIn: 86400,
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(body: any) {
    const { email, password, totpCode } = body;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.deletedAt) {
      throw new ForbiddenException(
        'Account is deactivated. Would you like to restore it?',
      );
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Two-factor authentication check
    if (user.isTwoFactorEnabled) {
      if (!totpCode) {
        throw new ForbiddenException(
          'Two-factor authentication code is required',
        );
      }

      const isValid = authenticator.check(totpCode, user.twoFactorSecret || '');
      if (!isValid) {
        throw new UnauthorizedException('Invalid authentication code');
      }
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
    );

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      accessToken,
      refreshToken,
      expiresIn: 86400,
    };
  }

  async generate2FASecret(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'Nutrify', secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    await this.db
      .update(users)
      .set({ twoFactorSecret: secret })
      .where(eq(users.id, userId));

    return { secret, qrCodeUrl };
  }

  async verify2FA(userId: string, token: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    const isValid = authenticator.check(token, user.twoFactorSecret);
    if (!isValid) {
      throw new BadRequestException('Invalid token');
    }

    await this.db
      .update(users)
      .set({ isTwoFactorEnabled: true })
      .where(eq(users.id, userId));

    return { message: 'Two-factor authentication enabled successfully' };
  }

  async disable2FA(userId: string, body: any) {
    const { password } = body;
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.db
      .update(users)
      .set({ isTwoFactorEnabled: false, twoFactorSecret: null })
      .where(eq(users.id, userId));

    return { message: 'Two-factor authentication disabled successfully' };
  }

  async refreshToken(body: any) {
    const { refreshToken } = body;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
          'dev-refresh-secret',
      });

      const { accessToken } = this.generateTokens(
        payload.userId,
        payload.email,
      );

      return {
        accessToken,
        expiresIn: 86400,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getMe(userId: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        heightCm: users.heightCm,
        currentWeightKg: users.currentWeightKg,
        targetWeightKg: users.targetWeightKg,
        gender: users.gender,
        dateOfBirth: users.dateOfBirth,
        phoneNumber: users.phoneNumber,
        activityLevel: users.activityLevel,
        culture: users.culture,
        religion: users.religion,
        medicalConditions: users.medicalConditions,
        medications: users.medications,
        allergies: users.allergies,
        dietaryRestrictions: users.dietaryRestrictions,
        dislikes: users.dislikes,
        streakDays: users.streakDays,
        badges: users.badges,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, body: any) {
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};
    const fields = [
      'fullName',
      'gender',
      'phoneNumber',
      'activityLevel',
      'culture',
      'religion',
      'medicalConditions',
      'medications',
      'allergies',
      'dietaryRestrictions',
      'dislikes',
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.dateOfBirth !== undefined) {
      updateData.dateOfBirth = body.dateOfBirth
        ? new Date(body.dateOfBirth)
        : null;
    }
    if (body.heightCm !== undefined) {
      updateData.heightCm = body.heightCm ? body.heightCm.toString() : null;
    }
    if (body.currentWeightKg !== undefined) {
      updateData.currentWeightKg = body.currentWeightKg
        ? body.currentWeightKg.toString()
        : null;
    }
    if (body.targetWeightKg !== undefined) {
      updateData.targetWeightKg = body.targetWeightKg
        ? body.targetWeightKg.toString()
        : null;
    }

    const [updatedUser] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        heightCm: users.heightCm,
        currentWeightKg: users.currentWeightKg,
        targetWeightKg: users.targetWeightKg,
        gender: users.gender,
        dateOfBirth: users.dateOfBirth,
        phoneNumber: users.phoneNumber,
        activityLevel: users.activityLevel,
        culture: users.culture,
        religion: users.religion,
        medicalConditions: users.medicalConditions,
        medications: users.medications,
        allergies: users.allergies,
        dietaryRestrictions: users.dietaryRestrictions,
        dislikes: users.dislikes,
        streakDays: users.streakDays,
        badges: users.badges,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUser;
  }

  async changePassword(userId: string, body: any) {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'Current password and new password are required',
      );
    }
    if (newPassword.length < 8) {
      throw new BadRequestException(
        'New password must be at least 8 characters',
      );
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, userId));

    return { message: 'Password changed successfully' };
  }

  async deleteAccount(userId: string) {
    await this.db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, userId));

    return {
      message:
        'Account deactivated successfully. You can restore it within 30 days by logging in.',
    };
  }

  async restoreAccount(body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.deletedAt) {
      throw new BadRequestException('Account is already active');
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.db
      .update(users)
      .set({ deletedAt: null })
      .where(eq(users.id, user.id));

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
    );

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      accessToken,
      refreshToken,
      expiresIn: 86400,
      message: 'Account restored successfully.',
    };
  }

  async verifyEmail(token: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.verificationToken, token),
          sql`${users.verificationExpires} > NOW()`,
        ),
      )
      .limit(1);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.db
      .update(users)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      })
      .where(eq(users.id, user.id));

    return { message: 'Email verified successfully. You can now login.' };
  }

  async forgotPassword(body: any) {
    const { email } = body;
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) {
      // Don't reveal user existence
      return {
        message:
          'Jika email terdaftar, kami telah mengirimkan link reset password.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.db
      .update(users)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      })
      .where(eq(users.id, user.id));

    // Send email logic would go here
    return {
      message:
        'Jika email terdaftar, kami telah mengirimkan link reset password.',
    };
  }

  async resetPassword(body: any) {
    const { token, newPassword } = body;
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    if (newPassword.length < 8) {
      throw new BadRequestException(
        'New password must be at least 8 characters',
      );
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, token),
          sql`${users.resetPasswordExpires} > NOW()`,
        ),
      )
      .limit(1);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    await this.db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(eq(users.id, user.id));

    return { message: 'Password reset successfully. You can now login.' };
  }
}
