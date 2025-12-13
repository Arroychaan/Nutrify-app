import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';

class MealPlanDetailScreen extends ConsumerWidget {
  final String mealPlanId;

  const MealPlanDetailScreen({super.key, required this.mealPlanId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // TODO: Fetch meal plan details

    return Scaffold(
      appBar: AppBar(title: const Text('Detail Meal Plan')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text('🍽️', style: TextStyle(fontSize: 40)),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Meal Plan ID: $mealPlanId',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Detail meal plan akan ditampilkan di sini',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
