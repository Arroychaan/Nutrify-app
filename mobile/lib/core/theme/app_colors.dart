import 'package:flutter/material.dart';

/// Nutrify Color Palette V1.1 (Premium)
class AppColors {
  // Primary - Dynamic Emerald Gradient
  static const Color primary = Color(0xFF10B981); // Emerald 500
  static const Color primaryDark = Color(0xFF059669); // Emerald 600
  static const Color primaryLight = Color(0xFF6EE7B7); // Emerald 300

  // Secondary - Accent Purple (Modern Tech feel)
  static const Color secondary = Color(0xFF6366F1); // Indigo 500
  static const Color secondaryLight = Color(0xFF818CF8);

  // Neutrals - Soft & Clean
  static const Color background = Color(0xFFF8FAFC); // Slate 50
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(
    0xFF0F172A,
  ); // Slate 900 (Darker, sharper)
  static const Color textSecondary = Color(0xFF475569); // Slate 600
  static const Color textTertiary = Color(0xFF94A3B8); // Slate 400

  static const Color border = Color(0xFFE2E8F0); // Slate 200
  static const Color divider = Color(0xFFF1F5F9); // Slate 100
  static const Color barrier = Color(0x660F172A); // Modal barrier

  // Status Colors (Vibrant)
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF0EA5E9); // Sky 500

  // BMI Colors
  static const Color bmiUnderweight = Color(0xFFEAB308);
  static const Color bmiNormal = Color(0xFF22C55E);
  static const Color bmiOverweight = Color(0xFFF97316);
  static const Color bmiObese = Color(0xFFEF4444);

  // Get BMI color based on value
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
    colors: [Color(0xFF10B981), Color(0xFF059669)], // Emerald to Teal
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accent = LinearGradient(
    colors: [Color(0xFF6366F1), Color(0xFF4F46E5)], // Indigo
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
