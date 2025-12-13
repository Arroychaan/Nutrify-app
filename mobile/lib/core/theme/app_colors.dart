import 'package:flutter/material.dart';

/// Nutrify color palette
class AppColors {
  // Primary - Nutrify Green
  static const Color primary = Color(0xFF24B47E);
  static const Color primaryLight = Color(0xFF4ECBA0);
  static const Color primaryDark = Color(0xFF1A8A5E);
  
  // Secondary - Purple accent
  static const Color secondary = Color(0xFF6366F1);
  static const Color secondaryLight = Color(0xFF818CF8);
  
  // Neutrals
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFF94A3B8);
  static const Color border = Color(0xFFE2E8F0);
  static const Color divider = Color(0xFFF1F5F9);
  
  // Status Colors
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // BMI Colors
  static const Color bmiUnderweight = Color(0xFFEAB308);
  static const Color bmiNormal = Color(0xFF22C55E);
  static const Color bmiOverweight = Color(0xFFF97316);
  static const Color bmiObese = Color(0xFFEF4444);
  
  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Get BMI color based on value
  static Color getBmiColor(double bmi) {
    if (bmi < 18.5) return bmiUnderweight;
    if (bmi < 25) return bmiNormal;
    if (bmi < 30) return bmiOverweight;
    return bmiObese;
  }
}
