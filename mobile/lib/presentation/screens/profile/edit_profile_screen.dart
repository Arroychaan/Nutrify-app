import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();

  // Controllers
  late TextEditingController _fullNameController;
  late TextEditingController _heightController;
  late TextEditingController _weightController;
  late TextEditingController _targetWeightController;

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProvider);
    _fullNameController = TextEditingController(text: user?.fullName ?? '');
    _heightController = TextEditingController(
      text: user?.heightCm.toInt().toString() ?? '',
    );
    _weightController = TextEditingController(
      text: user?.currentWeightKg.toInt().toString() ?? '',
    );
    _targetWeightController = TextEditingController(
      text: user?.targetWeightKg?.toInt().toString() ?? '',
    );
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    _targetWeightController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    final user = ref.read(currentUserProvider);
    if (user == null) return;

    final updatedData = {
      'fullName': _fullNameController.text.trim(),
      'heightCm': double.tryParse(_heightController.text) ?? user.heightCm,
      'currentWeightKg':
          double.tryParse(_weightController.text) ?? user.currentWeightKg,
      'targetWeightKg': _targetWeightController.text.isNotEmpty
          ? double.tryParse(_targetWeightController.text)
          : null,
    };

    final success = await ref
        .read(authProvider.notifier)
        .updateProfile(updatedData);

    if (success && mounted) {
      context.pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profil berhasil diperbarui'),
          backgroundColor: AppColors.success,
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Gagal memperbarui profil'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(isLoadingProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profil')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              AppTextField(
                controller: _fullNameController,
                label: 'Nama Lengkap',
                hint: 'Masukkan nama lengkap',
                prefixIcon: Icons.person_outline,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Nama harus diisi';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: AppTextField(
                      controller: _heightController,
                      label: 'Tinggi (cm)',
                      hint: '170',
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Harus diisi';
                        }
                        final h = double.tryParse(value);
                        if (h == null || h < 100 || h > 250) {
                          return 'Tidak valid';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppTextField(
                      controller: _weightController,
                      label: 'Berat (kg)',
                      hint: '70',
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Harus diisi';
                        }
                        final w = double.tryParse(value);
                        if (w == null || w < 30 || w > 300) {
                          return 'Tidak valid';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              AppTextField(
                controller: _targetWeightController,
                label: 'Target Berat (kg)',
                hint: '65',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 32),
              AppButton(
                text: 'Simpan Perubahan',
                onPressed: isLoading ? null : _saveProfile,
                isLoading: isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
