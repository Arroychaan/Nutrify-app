import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/router_provider.dart';
import '../../widgets/common/app_button.dart';

class GenerateMealPlanScreen extends ConsumerStatefulWidget {
  const GenerateMealPlanScreen({super.key});

  @override
  ConsumerState<GenerateMealPlanScreen> createState() =>
      _GenerateMealPlanScreenState();
}

class _GenerateMealPlanScreenState
    extends ConsumerState<GenerateMealPlanScreen> {
  String _selectedDuration = '7_days';
  bool _isLoading = false;
  String? _error;

  final Map<String, String> _durations = {
    '1_day': '1 Hari',
    '3_days': '3 Hari',
    '7_days': '1 Minggu',
    '14_days': '2 Minggu',
  };

  Future<void> _generateMealPlan() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await ApiClient.instance.generateMealPlan({
        'duration': _selectedDuration,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final mealPlanId = response.data['data']?['id'] ?? response.data['id'];
        if (!mounted) return;
        if (mealPlanId != null) {
          context.go('/meal-plans/$mealPlanId');
        } else {
          context.go(AppRoutes.mealPlans);
        }
      } else {
        setState(() {
          _error = response.data['message'] ?? 'Gagal generate meal plan';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Gagal generate meal plan. Pastikan koneksi internet stabil.';
      });
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Generate Meal Plan')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'AI Meal Plan Generator',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Meal plan personal sesuai kebutuhan kalori, kondisi kesehatan, dan preferensi budayamu.',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.9),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Text('🤖', style: TextStyle(fontSize: 48)),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Duration selection
            Text('Pilih Durasi', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),

            ..._durations.entries.map(
              (entry) => _DurationOption(
                value: entry.key,
                label: entry.value,
                isSelected: _selectedDuration == entry.key,
                onTap: () => setState(() => _selectedDuration = entry.key),
              ),
            ),

            const SizedBox(height: 24),

            // Info
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.info.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.info.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: AppColors.info),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Meal plan akan disesuaikan dengan data profil kamu (tinggi, berat, kondisi kesehatan, alergi, preferensi budaya).',
                      style: TextStyle(
                        color: AppColors.info.withValues(alpha: 0.9),
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            if (_error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: AppColors.error,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _error!,
                        style: const TextStyle(color: AppColors.error),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 32),

            // Generate button
            AppButton(
              text: 'Generate Meal Plan',
              icon: Icons.auto_awesome,
              onPressed: _isLoading ? null : _generateMealPlan,
              isLoading: _isLoading,
            ),
          ],
        ),
      ),
    );
  }
}

class _DurationOption extends StatelessWidget {
  final String value;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _DurationOption({
    required this.value,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.1)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : AppColors.textTertiary,
                  width: 2,
                ),
                color: isSelected ? AppColors.primary : Colors.transparent,
              ),
              child: isSelected
                  ? const Icon(Icons.check, size: 16, color: Colors.white)
                  : null,
            ),
            const SizedBox(width: 16),
            Text(
              label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
