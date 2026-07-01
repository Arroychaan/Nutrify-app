import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/food_log_model.dart';
import '../../providers/router_provider.dart';
import '../../providers/share_provider.dart';
import '../../widgets/sharing/daily_summary_share_card.dart';

import '../../../core/network/api_client.dart';

// Food logs provider
final foodLogsProvider = FutureProvider<List<FoodLogModel>>((ref) async {
  try {
    final response = await ApiClient.instance.getFoodLogs();

    if (response.statusCode == 200) {
      final data = response.data['data'];
      final List<dynamic> logs = data['logs'] ?? [];
      return logs.map((json) => FoodLogModel.fromJson(json)).toList();
    }
    throw Exception('Gagal memuat food logs');
  } catch (e) {
    throw Exception('Terjadi kesalahan: $e');
  }
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

class _DailySummaryCard extends ConsumerWidget {
  final List<FoodLogModel> logs;

  const _DailySummaryCard({required this.logs});

  Future<void> _onShare(BuildContext context, WidgetRef ref) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Menyiapkan ringkasan nutrisi... 📊'),
        duration: Duration(seconds: 1),
      ),
    );

    try {
      // Calculate totals
      double calories = 0, protein = 0, carbs = 0, fat = 0;
      for (var log in logs) {
        calories += log.calories ?? 0;
        protein += log.proteinG ?? 0;
        carbs += log.carbsG ?? 0;
        fat += log.fatG ?? 0;
      }

      final shareWidget = DailySummaryShareCard(
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        date: DateTime.now(),
      );

      await ref
          .read(socialShareServiceProvider)
          .shareWidget(
            widget: shareWidget,
            context: context,
            text:
                'Nutrisi harian saya hari ini di AI Ate Indonesia! 🥗 Tetap sehat, tetap semangat! #AI Ate IndonesiaDaily',
          );
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Gagal membagikan.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final totalCalories = logs.fold<double>(
      0,
      (sum, log) => sum + (log.calories ?? 0),
    );

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppGradients.primary,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Stack(
        children: [
          Column(
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
          Positioned(
            right: 0,
            top: 0,
            child: IconButton(
              onPressed: () => _onShare(context, ref),
              icon: const Icon(Icons.share, color: Colors.white70),
              tooltip: 'Bagikan Ringkasan',
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
