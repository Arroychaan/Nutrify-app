import nodemailer from 'nodemailer';
import config from '@config/index.js';
import logger from '@config/logger.js';

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

export const sendVerificationEmail = async (to: string, token: string) => {
    // Check if email is configured
    if (!config.email.host || !config.email.user || !config.email.pass) {
        logger.warn('Email service not fully configured. Skipping verification email sending.', {
            host: config.email.host,
            user: config.email.user ? '***' : 'missing'
        });
        // For dev purposes, log the link so developers can still click it
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;
        logger.info('>>> MOCK EMAIL: Verify Link: ' + verificationUrl);
        return;
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;

    const mailOptions = {
        from: config.email.from,
        to,
        subject: 'Nutrify - Verifikasi Email Anda',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #24B47E;">Nutrify</h1>
        </div>
        <h2>Selamat Datang!</h2>
        <p>Terima kasih telah mendaftar di Nutrify. Langkah terakhir untuk mengaktifkan akun Anda adalah memverifikasi alamat email ini.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #24B47E; color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">Verifikasi Sekarang</a>
        </div>
        <p style="color: #666;">Jika tombol di atas tidak berfungsi, salin dan tempel link berikut ke browser Anda:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p>Link ini akan kadaluarsa dalam 24 jam.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Nutrify. All rights reserved.</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info('Verification email sent', { to });
    } catch (error) {
        logger.error('Failed to send verification email', { error, to });
        // Don't throw here to avoid blocking registration if email fails (unless critical requirement)
        // But usually we wan't to know. For now, we log major error.
    }
};
