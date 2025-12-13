import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/router_provider.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _pageController = PageController();
  int _currentPage = 0;

  // Form controllers
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _fullNameController = TextEditingController();
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();
  final _targetWeightController = TextEditingController();

  String? _selectedGender;
  String? _selectedActivityLevel;
  String? _selectedCulture;
  String? _selectedReligion;
  final List<String> _selectedMedicalConditions = [];
  final List<String> _selectedAllergies = [];

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _pageController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _fullNameController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    _targetWeightController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final userData = {
      'email': _emailController.text.trim(),
      'password': _passwordController.text,
      'fullName': _fullNameController.text.trim(),
      'heightCm': double.tryParse(_heightController.text) ?? 170,
      'currentWeightKg': double.tryParse(_weightController.text) ?? 70,
      'targetWeightKg': _targetWeightController.text.isNotEmpty
          ? double.tryParse(_targetWeightController.text)
          : null,
      'gender': _selectedGender,
      'activityLevel': _selectedActivityLevel ?? 'moderate',
      'culture': _selectedCulture,
      'religion': _selectedReligion,
      'medicalConditions': _selectedMedicalConditions,
      'allergies': _selectedAllergies,
    };

    final success = await ref.read(authProvider.notifier).register(userData);

    if (success && mounted) {
      context.go(AppRoutes.dashboard);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        leading: _currentPage > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: _previousPage,
              )
            : IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => context.go(AppRoutes.login),
              ),
        title: Text('Daftar (${_currentPage + 1}/3)'),
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            // Progress indicator
            LinearProgressIndicator(
              value: (_currentPage + 1) / 3,
              backgroundColor: AppColors.border,
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColors.primary,
              ),
            ),

            // Error message
            if (authState.error != null)
              Container(
                margin: const EdgeInsets.all(16),
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
                        authState.error!,
                        style: const TextStyle(color: AppColors.error),
                      ),
                    ),
                  ],
                ),
              ),

            // Pages
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                onPageChanged: (page) => setState(() => _currentPage = page),
                children: [
                  _buildAccountPage(),
                  _buildPhysicalPage(),
                  _buildPreferencesPage(),
                ],
              ),
            ),

            // Bottom button
            Padding(
              padding: const EdgeInsets.all(16),
              child: _currentPage < 2
                  ? AppButton(text: 'Lanjut', onPressed: _nextPage)
                  : AppButton(
                      text: 'Daftar',
                      onPressed: authState.isLoading ? null : _handleRegister,
                      isLoading: authState.isLoading,
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Buat Akun', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text(
            'Isi data akun kamu untuk memulai',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),

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

          AppTextField(
            controller: _emailController,
            label: 'Email',
            hint: 'contoh@email.com',
            keyboardType: TextInputType.emailAddress,
            prefixIcon: Icons.email_outlined,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Email harus diisi';
              }
              if (!value.contains('@')) {
                return 'Email tidak valid';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),

          AppTextField(
            controller: _passwordController,
            label: 'Password',
            hint: 'Minimal 6 karakter',
            obscureText: _obscurePassword,
            prefixIcon: Icons.lock_outline,
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword ? Icons.visibility_off : Icons.visibility,
                color: AppColors.textTertiary,
              ),
              onPressed: () =>
                  setState(() => _obscurePassword = !_obscurePassword),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Password harus diisi';
              }
              if (value.length < 6) {
                return 'Password minimal 6 karakter';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),

          AppTextField(
            controller: _confirmPasswordController,
            label: 'Konfirmasi Password',
            hint: 'Ulangi password',
            obscureText: _obscureConfirmPassword,
            prefixIcon: Icons.lock_outline,
            suffixIcon: IconButton(
              icon: Icon(
                _obscureConfirmPassword
                    ? Icons.visibility_off
                    : Icons.visibility,
                color: AppColors.textTertiary,
              ),
              onPressed: () => setState(
                () => _obscureConfirmPassword = !_obscureConfirmPassword,
              ),
            ),
            validator: (value) {
              if (value != _passwordController.text) {
                return 'Password tidak sama';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPhysicalPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Data Fisik', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text(
            'Data ini untuk menghitung kebutuhan kalori kamu',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),

          // Gender
          Text('Jenis Kelamin', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _GenderCard(
                  label: 'Laki-laki',
                  icon: Icons.male,
                  isSelected: _selectedGender == 'male',
                  onTap: () => setState(() => _selectedGender = 'male'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _GenderCard(
                  label: 'Perempuan',
                  icon: Icons.female,
                  isSelected: _selectedGender == 'female',
                  onTap: () => setState(() => _selectedGender = 'female'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: AppTextField(
                  controller: _heightController,
                  label: 'Tinggi Badan (cm)',
                  hint: '170',
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Harus diisi';
                    }
                    final height = double.tryParse(value);
                    if (height == null || height < 100 || height > 250) {
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
                  label: 'Berat Badan (kg)',
                  hint: '70',
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Harus diisi';
                    }
                    final weight = double.tryParse(value);
                    if (weight == null || weight < 30 || weight > 300) {
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
            label: 'Target Berat Badan (kg) - Opsional',
            hint: '65',
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),

          // Activity level
          Text(
            'Tingkat Aktivitas',
            style: Theme.of(context).textTheme.labelLarge,
          ),
          const SizedBox(height: 8),
          // ignore: deprecated_member_use
          ...AppConstants.activityLevels.map((level) {
            final isSelected = _selectedActivityLevel == level;
            return InkWell(
              onTap: () => setState(() => _selectedActivityLevel = level),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 8.0,
                  horizontal: 4.0,
                ),
                child: Row(
                  children: [
                    Icon(
                      isSelected
                          ? Icons.radio_button_checked
                          : Icons.radio_button_unchecked,
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.textTertiary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        AppConstants.activityLevelLabels[level] ?? level,
                        style: TextStyle(
                          color: isSelected
                              ? AppColors.getBmiColor(
                                  22,
                                ) // Use a safe color or specific one if AppColors.textPrimary is missing
                              : AppColors.textTertiary, // Fallback safe color
                          fontWeight: isSelected
                              ? FontWeight.w600
                              : FontWeight.normal,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildPreferencesPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Preferensi', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text(
            'Untuk personalisasi meal plan kamu',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),

          // Culture
          Text('Budaya/Suku', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: AppConstants.cultures
                .map(
                  (culture) => ChoiceChip(
                    label: Text(culture),
                    selected: _selectedCulture == culture,
                    onSelected: (selected) {
                      setState(
                        () => _selectedCulture = selected ? culture : null,
                      );
                    },
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 16),

          // Religion
          Text('Agama', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: AppConstants.religions
                .map(
                  (religion) => ChoiceChip(
                    label: Text(religion),
                    selected: _selectedReligion == religion,
                    onSelected: (selected) {
                      setState(
                        () => _selectedReligion = selected ? religion : null,
                      );
                    },
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 16),

          // Medical conditions
          Text(
            'Kondisi Medis (Opsional)',
            style: Theme.of(context).textTheme.labelLarge,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: AppConstants.medicalConditions
                .map(
                  (condition) => FilterChip(
                    label: Text(condition),
                    selected: _selectedMedicalConditions.contains(condition),
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedMedicalConditions.add(condition);
                        } else {
                          _selectedMedicalConditions.remove(condition);
                        }
                      });
                    },
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 16),

          // Allergies
          Text(
            'Alergi (Opsional)',
            style: Theme.of(context).textTheme.labelLarge,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: AppConstants.commonAllergies
                .map(
                  (allergy) => FilterChip(
                    label: Text(allergy),
                    selected: _selectedAllergies.contains(allergy),
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedAllergies.add(allergy);
                        } else {
                          _selectedAllergies.remove(allergy);
                        }
                      });
                    },
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _GenderCard extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _GenderCard({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
        child: Column(
          children: [
            Icon(
              icon,
              size: 32,
              color: isSelected ? AppColors.primary : AppColors.textTertiary,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
