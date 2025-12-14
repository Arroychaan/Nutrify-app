import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';
import '../../providers/streak_provider.dart';

class AddFoodLogScreen extends ConsumerStatefulWidget {
  const AddFoodLogScreen({super.key});

  @override
  ConsumerState<AddFoodLogScreen> createState() => _AddFoodLogScreenState();
}

class _AddFoodLogScreenState extends ConsumerState<AddFoodLogScreen> {
  final _formKey = GlobalKey<FormState>();
  final _foodNameController = TextEditingController();
  final _portionController = TextEditingController();
  final _caloriesController = TextEditingController();
  final _notesController = TextEditingController();

  String _selectedMealType = 'lunch';
  bool _isLoading = false;
  String? _error;

  @override
  void dispose() {
    _foodNameController.dispose();
    _portionController.dispose();
    _caloriesController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _saveFoodLog() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await ApiClient.instance.createFoodLog({
        'mealType': _selectedMealType,
        'foodName': _foodNameController.text.trim(),
        'portion': _portionController.text.trim().isNotEmpty
            ? _portionController.text.trim()
            : null,
        'calories': double.tryParse(_caloriesController.text),
        'notes': _notesController.text.trim().isNotEmpty
            ? _notesController.text.trim()
            : null,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Makanan berhasil dicatat!'),
              backgroundColor: AppColors.success,
            ),
          );
          // Refresh streak
          ref.read(streakProvider.notifier).refreshStreak();
          context.pop();
        }
      } else {
        setState(() {
          _error = response.data['message'] ?? 'Gagal menyimpan';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Gagal menyimpan. Cek koneksi internet.';
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
      appBar: AppBar(title: const Text('Catat Makanan')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Meal type selection
            Text('Waktu Makan', style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: AppConstants.mealTypes
                  .map(
                    (type) => ChoiceChip(
                      label: Text(AppConstants.mealTypeLabels[type] ?? type),
                      selected: _selectedMealType == type,
                      onSelected: (selected) {
                        if (selected) setState(() => _selectedMealType = type);
                      },
                    ),
                  )
                  .toList(),
            ),

            const SizedBox(height: 16),

            // Food name
            AppTextField(
              controller: _foodNameController,
              label: 'Nama Makanan',
              hint: 'Contoh: Nasi Goreng',
              prefixIcon: Icons.restaurant,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Nama makanan harus diisi';
                }
                return null;
              },
            ),

            const SizedBox(height: 16),

            // Portion
            AppTextField(
              controller: _portionController,
              label: 'Porsi (opsional)',
              hint: 'Contoh: 1 piring, 200g',
              prefixIcon: Icons.straighten,
            ),

            const SizedBox(height: 16),

            // Calories
            AppTextField(
              controller: _caloriesController,
              label: 'Kalori (opsional)',
              hint: 'Contoh: 350',
              keyboardType: TextInputType.number,
              prefixIcon: Icons.local_fire_department,
            ),

            const SizedBox(height: 16),

            // Notes
            AppTextField(
              controller: _notesController,
              label: 'Catatan (opsional)',
              hint: 'Tambahkan catatan...',
              maxLines: 3,
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

            const SizedBox(height: 24),

            // Save button
            AppButton(
              text: 'Simpan',
              onPressed: _isLoading ? null : _saveFoodLog,
              isLoading: _isLoading,
            ),
          ],
        ),
      ),
    );
  }
}
