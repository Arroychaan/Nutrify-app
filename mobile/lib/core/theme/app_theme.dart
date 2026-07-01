import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// AI Ate Indonesia V1.1 Premium Theme
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: Colors.white,
        secondary: AppColors.secondary,
        onSecondary: Colors.white,
        surface: AppColors.surfaceLight,
        onSurface: AppColors.textLightPrimary,
        error: AppColors.error,
        onError: Colors.white,
        outline: AppColors.borderLight,
      ),
      scaffoldBackgroundColor: AppColors.backgroundLight,
      textTheme: _buildTextTheme(AppColors.textLightPrimary, AppColors.textLightSecondary, AppColors.textLightTertiary),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surfaceLight,
        foregroundColor: AppColors.textLightPrimary,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.textLightPrimary,
        ),
      ),
      elevatedButtonTheme: _buildElevatedButtonTheme(),
      outlinedButtonTheme: _buildOutlinedButtonTheme(AppColors.primary),
      inputDecorationTheme: _buildInputDecorationTheme(AppColors.surfaceLight, AppColors.borderLight, AppColors.textLightSecondary),
      cardTheme: _buildCardTheme(AppColors.surfaceLight, AppColors.borderLight),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        onPrimary: Colors.white,
        secondary: AppColors.secondary,
        onSecondary: Colors.white,
        surface: AppColors.surfaceDark,
        onSurface: AppColors.textDarkPrimary,
        error: AppColors.error,
        onError: Colors.white,
        outline: AppColors.borderDark,
      ),
      scaffoldBackgroundColor: AppColors.backgroundDark,
      textTheme: _buildTextTheme(AppColors.textDarkPrimary, AppColors.textDarkSecondary, AppColors.textDarkTertiary),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surfaceDark,
        foregroundColor: AppColors.textDarkPrimary,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.textDarkPrimary,
        ),
      ),
      elevatedButtonTheme: _buildElevatedButtonTheme(),
      outlinedButtonTheme: _buildOutlinedButtonTheme(AppColors.primaryLight),
      inputDecorationTheme: _buildInputDecorationTheme(AppColors.surfaceDark, AppColors.borderDark, AppColors.textDarkSecondary),
      cardTheme: _buildCardTheme(AppColors.surfaceDark, AppColors.borderDark),
    );
  }

  static TextTheme _buildTextTheme(Color primary, Color secondary, Color tertiary) {
    return TextTheme(
      displayLarge: GoogleFonts.fraunces(fontSize: 32, fontWeight: FontWeight.w300, color: primary, height: 1.2, letterSpacing: -0.02),
      displayMedium: GoogleFonts.fraunces(fontSize: 28, fontWeight: FontWeight.w300, color: primary, height: 1.2, letterSpacing: -0.02),
      headlineLarge: GoogleFonts.fraunces(fontSize: 24, fontWeight: FontWeight.w300, color: primary, height: 1.3),
      headlineMedium: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w600, color: primary, height: 1.3),
      titleLarge: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.w600, color: primary, height: 1.4),
      titleMedium: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w600, color: primary, height: 1.4),
      bodyLarge: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.normal, color: primary, height: 1.5),
      bodyMedium: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.normal, color: secondary, height: 1.5),
      bodySmall: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.normal, color: tertiary, height: 1.5),
      labelLarge: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.w600, color: primary),
    );
  }

  static ElevatedButtonThemeData _buildElevatedButtonTheme() {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textLightPrimary,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    );
  }

  static OutlinedButtonThemeData _buildOutlinedButtonTheme(Color color) {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        side: BorderSide(color: color, width: 0.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    );
  }

  static InputDecorationTheme _buildInputDecorationTheme(Color fill, Color border, Color hint) {
    return InputDecorationTheme(
      filled: true,
      fillColor: fill,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      hintStyle: GoogleFonts.plusJakartaSans(fontSize: 14, color: hint),
      labelStyle: GoogleFonts.plusJakartaSans(fontSize: 14, color: hint),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: border, width: 0.5)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: border, width: 0.5)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 1)),
      errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.error)),
    );
  }

  static CardThemeData _buildCardTheme(Color color, Color border) {
    return CardThemeData(
      color: color,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: border, width: 0.5),
      ),
    );
  }
}
