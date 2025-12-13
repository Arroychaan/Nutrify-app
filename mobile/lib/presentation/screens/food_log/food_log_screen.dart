import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/food_log_model.dart';
import '../../providers/router_provider.dart';

// Simple food logs provider
final foodLogsProvider = FutureProvider<List<FoodLogModel>>((ref) async {
  await Future.delayed(const Duration(seconds: 1));
  return []; // Return empty for now
});

class FoodLogScreen extends ConsumerWidget {
  const FoodLogScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logsAsync = ref.watch(foodLogsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Food Log')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(AppRoutes.addFoodLog),
        icon: const Icon(Icons.add),
        label: const Text('Catat Makanan'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: logsAsync.when(
        data: (logs) {
          if (logs.isEmpty) {
            return _EmptyState();
          }
          return _FoodLogList(logs: logs);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              const Text('Gagal memuat data'),
              TextButton(
                onPressed: () => ref.refresh(foodLogsProvider),
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
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text('📝', style: TextStyle(fontSize: 50)),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Belum Ada Catatan',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Mulai catat makananmu untuk memantau asupan kalori harian.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}

class _FoodLogList extends StatelessWidget {
  final List<FoodLogModel> logs;

  const _FoodLogList({required this.logs});

  @override
  Widget build(BuildContext context) {
    // Group by meal type
    final Map<String, List<FoodLogModel>> grouped = {};
    for (final mealType in AppConstants.mealTypes) {
      grouped[mealType] = logs.where((l) => l.mealType == mealType).toList();
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Today's summary
        _DailySummaryCard(logs: logs),
        const SizedBox(height: 16),

        // Grouped logs
        ...AppConstants.mealTypes
            .where((type) => grouped[type]!.isNotEmpty)
            .map((type) => _MealSection(mealType: type, logs: grouped[type]!)),
      ],
    );
  }
}

class _DailySummaryCard extends StatelessWidget {
  final List<FoodLogModel> logs;

  const _DailySummaryCard({required this.logs});

  @override
  Widget build(BuildContext context) {
    final totalCalories = logs.fold<double>(
      0,
      (sum, log) => sum + (log.calories ?? 0),
    );

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          const Text(
            'Total Hari Ini',
            style: TextStyle(color: Colors.white70, fontSize: 14),
          ),
          const SizedBox(height: 8),
          Text(
            '${totalCalories.toInt()} kcal',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 36,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class _MealSection extends StatelessWidget {
  final String mealType;
  final List<FoodLogModel> logs;

  const _MealSection({required this.mealType, required this.logs});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Text(
            AppConstants.mealTypeLabels[mealType] ?? mealType,
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
        ...logs.map((log) => _FoodLogCard(log: log)),
        const SizedBox(height: 8),
      ],
    );
  }
}

class _FoodLogCard extends StatelessWidget {
  final FoodLogModel log;

  const _FoodLogCard({required this.log});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  log.foodName,
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                if (log.portion != null)
                  Text(
                    log.portion!,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
              ],
            ),
          ),
          Text(
            '${log.calories?.toInt() ?? 0} kcal',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
