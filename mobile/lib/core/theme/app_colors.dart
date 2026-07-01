import 'package:flutter/material.dart';

/// AI Ate Indonesia Color Palette - Master Brief (Earthy Premium)
class AppColors {
  // Primary Backgrounds (Light & Dark Earthy)
  static const Color backgroundLight = Color(0xFFFDFBF7); // Cream
  static const Color backgroundDark = Color(0xFF1E1810); // Dark Earthy
  
  // Surfaces
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceLight2 = Color(0xFFF4F0E6);
  static const Color surfaceDark = Color(0xFF2A241D);
  static const Color surfaceDark2 = Color(0xFF362E25);

  // Text Light Theme (Dark Ink)
  static const Color textLightPrimary = Color(0xFF1E1810);
  static const Color textLightSecondary = Color(0xFF4A3F35);
  static const Color textLightTertiary = Color(0xFF8A7A6A);
  
  // Text Dark Theme (Cream/Muted)
  static const Color textDarkPrimary = Color(0xFFFAF0E0);
  static const Color textDarkSecondary = Color(0xFF8A7A6A);
  static const Color textDarkTertiary = Color(0xFF6A5A4A);

  // Accents
  static const Color primary = Color(0xFFC4603A); // Terracotta (Action)
  static const Color primaryDark = Color(0xFF9A4C2E);
  static const Color primaryLight = Color(0xFFD5724D);
  static const Color primaryMuted = Color(0xFF4A281A);

  static const Color secondary = Color(0xFFE8A838); // Gold (Highlights)
  static const Color secondaryDark = Color(0xFFC88A20);
  static const Color secondaryLight = Color(0xFFF0C060);
  static const Color secondaryPale = Color(0xFF2A2010);

  static const Color premium = Color(0xFFE090C0); // Pink (Pro)
  static const Color premiumLight = Color(0xFFF0A0D0);

  static const Color success = Color(0xFF3D6B4F); // Green
  static const Color successLight = Color(0xFF7FD49A);
  static const Color successMuted = Color(0xFF1A3A20);

  // Structural & Borders
  static const Color borderLight = Color(0xFFEBE4D5); // Soft border for light
  static const Color borderDark = Color(0x1AFAF0E0);
  static const Color dividerLight = Color(0xFFEBE4D5);
  static const Color dividerDark = Color(0x1AFAF0E0);
  static const Color barrier = Color(0x99000000); 

  // Status Colors
  static const Color warning = Color(0xFFE8A838);
  static const Color error = Color(0xFFC4603A);
  static const Color info = Color(0xFF70C0E8);

  // BMI Colors (Semantic mapping)
  static const Color bmiUnderweight = Color(0xFFE8A838);
  static const Color bmiNormal = Color(0xFF3D6B4F);
  static const Color bmiOverweight = Color(0xFFC4603A);
  static const Color bmiObese = Color(0xFF9A4C2E);

  static const Color surface = surfaceLight;
  static const Color textPrimary = textLightPrimary;
  static const Color textSecondary = textLightSecondary;
  static const Color textTertiary = textLightTertiary;
  static const Color border = borderLight;

  static Color getBmiColor(double bmi) {
    if (bmi < 18.5) return bmiUnderweight;
    if (bmi < 25) return bmiNormal;
    if (bmi < 30) return bmiOverweight;
    return bmiObese;
  }
}

/// Premium V1.1 Gradients
class AppGradients {
  static const LinearGradient primary = LinearGradient(
    colors: [AppColors.primary, AppColors.primaryLight], // Terracotta
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accent = LinearGradient(
    colors: [AppColors.secondary, AppColors.secondaryLight], // Gold
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient fire = LinearGradient(
    colors: [Color(0xFFF59E0B), Color(0xFFEA580C)], // Amber to Orange
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient blue = LinearGradient(
    colors: [Color(0xFF3B82F6), Color(0xFF2563EB)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static LinearGradient glass = LinearGradient(
    colors: [
      Colors.white.withValues(alpha: 0.8),
      Colors.white.withValues(alpha: 0.4),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

/// Soft Shadows for Depth
class AppShadows {
  static List<BoxShadow> small = [
    BoxShadow(
      color: const Color(0xFF64748B).withValues(alpha: 0.08),
      offset: const Offset(0, 2),
      blurRadius: 4,
    ),
  ];

  static List<BoxShadow> medium = [
    BoxShadow(
      color: const Color(0xFF64748B).withValues(alpha: 0.12),
      offset: const Offset(0, 4),
      blurRadius: 12,
      spreadRadius: -2,
    ),
  ];

  static List<BoxShadow> large = [
    BoxShadow(
      color: const Color(0xFF64748B).withValues(alpha: 0.15),
      offset: const Offset(0, 10),
      blurRadius: 20,
      spreadRadius: -5,
    ),
  ];

  static BoxShadow glow(Color color) => BoxShadow(
    color: color.withValues(alpha: 0.3),
    offset: const Offset(0, 4),
    blurRadius: 12,
  );
}
