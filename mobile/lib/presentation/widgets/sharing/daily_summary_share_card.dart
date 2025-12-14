import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class DailySummaryShareCard extends StatelessWidget {
  final double calories;
  final double protein;
  final double carbs;
  final double fat;
  final DateTime date;

  const DailySummaryShareCard({
    super.key,
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 400,
      height: 400,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(0), // Square for posts
      ),
      child: Stack(
        children: [
          // Background Branding
          Positioned(
            bottom: -50,
            right: -50,
            child: Icon(
              Icons.spa_rounded,
              size: 200,
              color: AppColors.primary.withValues(alpha: 0.05),
            ),
          ),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'NUTRIFY',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                      ),
                      Text(
                        'DAILY SUMMARY',
                        style: TextStyle(
                          color: Colors.grey[400],
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${date.day}/${date.month}/${date.year}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),

              const Spacer(),

              // Main Stats
              Center(
                child: Column(
                  children: [
                    const Text(
                      'TOTAL INTAKE',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 12,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${calories.toInt()}',
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 64,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const TextSpan(
                            text: ' kcal',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 24,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // Macros
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _MacroItem(
                      'PROTEIN',
                      '${protein.toInt()}g',
                      AppColors.info,
                    ),
                    _MacroItem('CARBS', '${carbs.toInt()}g', AppColors.warning),
                    _MacroItem('FAT', '${fat.toInt()}g', AppColors.error),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              const Center(
                child: Text(
                  'Join the healthy movement on Nutrify App',
                  style: TextStyle(color: AppColors.textTertiary, fontSize: 12),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MacroItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MacroItem(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[500],
            fontSize: 10,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
