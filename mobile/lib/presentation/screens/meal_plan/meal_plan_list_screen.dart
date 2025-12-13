import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/meal_plan_model.dart';
import '../../providers/router_provider.dart';
import '../../widgets/common/app_button.dart';

// Simple provider for meal plans
final mealPlansProvider = FutureProvider<List<MealPlanModel>>((ref) async {
  // TODO: Implement actual API call
  await Future.delayed(const Duration(seconds: 1));
  return []; // Return empty for now
});

class MealPlanListScreen extends ConsumerWidget {
  const MealPlanListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mealPlansAsync = ref.watch(mealPlansProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meal Plans'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push(AppRoutes.generateMealPlan),
          ),
        ],
      ),
      body: mealPlansAsync.when(
        data: (mealPlans) {
          if (mealPlans.isEmpty) {
            return _EmptyState(
              onGenerate: () => context.push(AppRoutes.generateMealPlan),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: mealPlans.length,
            itemBuilder: (context, index) {
              final plan = mealPlans[index];
              return _MealPlanCard(
                mealPlan: plan,
                onTap: () => context.push('/meal-plans/${plan.id}'),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              Text('Gagal memuat meal plans'),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.refresh(mealPlansProvider),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final VoidCallback onGenerate;

  const _EmptyState({required this.onGenerate});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text('🍽️', style: TextStyle(fontSize: 60)),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Belum Ada Meal Plan',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Buat meal plan pertamamu dan mulai perjalanan hidup sehat!',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            AppButton(
              text: 'Generate Meal Plan',
              icon: Icons.auto_awesome,
              onPressed: onGenerate,
              width: 200,
            ),
          ],
        ),
      ),
    );
  }
}

class _MealPlanCard extends StatelessWidget {
  final MealPlanModel mealPlan;
  final VoidCallback onTap;

  const _MealPlanCard({required this.mealPlan, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    mealPlan.durationLabel,
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ),
                const Spacer(),
                const Icon(Icons.chevron_right, color: AppColors.textTertiary),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '${mealPlan.avgCalories.toInt()} kcal/hari',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _InfoChip(
                  label: 'AKG ${mealPlan.akgCompliance.toInt()}%',
                  color: AppColors.success,
                ),
                const SizedBox(width: 8),
                _InfoChip(
                  label: 'Lokal ${mealPlan.localFoodPercentage.toInt()}%',
                  color: AppColors.info,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final Color color;

  const _InfoChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
