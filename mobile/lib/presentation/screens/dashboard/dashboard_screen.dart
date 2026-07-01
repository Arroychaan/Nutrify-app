import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/router_provider.dart';
import '../../providers/streak_provider.dart';
import '../../providers/nutrition_provider.dart';
import '../../widgets/glass_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final streakAsync = ref.watch(streakProvider);
    final nutritionAsync = ref.watch(todayNutritionProvider);

    final streakDays = streakAsync.when(
      data: (val) => val,
      loading: () => user?.streakDays ?? 0,
      error: (error, stack) => user?.streakDays ?? 0,
    );

    return Scaffold(
      backgroundColor: const Color(
        0xFFF1F5F9,
      ), // Slightly different bg for contrast
      body: Stack(
        children: [
          // Top Decorative Gradient Blob
          Positioned(
            top: -100,
            right: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.2),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Header Section
                  _buildHeader(context, user),

                  const SizedBox(height: 24),

                  // 2. Nutrition Summary Card (Hero Widget)
                  _NutritionSummaryCard(nutritionAsync: nutritionAsync),

                  const SizedBox(height: 24),

                  // 3. Streak Banner (Mini)
                  _StreakBanner(streakDays: streakDays),

                  const SizedBox(height: 24),

                  // 4. Feature Grid (The Core Navigation)
                  Text(
                    'Menu Utama',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildFeatureGrid(context),

                  const SizedBox(height: 100), // Bottom padding
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, dynamic user) {
    final name = user?.fullName.split(' ').first ?? 'Sahabat';
    // Dynamic greeting based on time could go here, stuck to simple for now
    // Dynamic greeting based on time
    final hour = DateTime.now().hour;
    String greeting;
    if (hour < 11) {
      greeting = 'Selamat Pagi';
    } else if (hour < 15) {
      greeting = 'Selamat Siang';
    } else if (hour < 19) {
      greeting = 'Selamat Sore';
    } else {
      greeting = 'Selamat Malam';
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '$greeting, $name! 👋',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Ayo capai target nutrisimu hari ini!',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.border),
            image: const DecorationImage(
              image: AssetImage(
                'assets/icons/avatar_placeholder.png',
              ), // Fallback if no asset
              fit: BoxFit.cover,
            ),
          ),
          child: user?.fullName != null
              ? Center(
                  child: Text(
                    user!.fullName[0],
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: AppColors.primary,
                    ),
                  ),
                )
              : const Icon(Icons.person, color: AppColors.textTertiary),
        ),
      ],
    );
  }

  Widget _buildFeatureGrid(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width =
            (constraints.maxWidth - 16) / 2; // 2 columns with 16px gap

        return Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            _FeatureCard(
              width: width,
              title: 'Generate\nMeal Plan',
              subtitle: 'Rencana makan harian',
              icon: Icons.restaurant_menu,
              gradient: AppGradients.primary,
              onTap: () => context.push(AppRoutes.generateMealPlan),
            ),
            _FeatureCard(
              width: width,
              title: 'Konsultasi\nAI Dietician',
              subtitle: 'Tanya jawab gizi',
              icon: Icons.auto_awesome,
              gradient: AppGradients.accent, // Purple for AI
              onTap: () => context.go(AppRoutes.chat),
            ),
            _FeatureCard(
              width: width,
              title: 'Jurnal\nMakanan',
              subtitle: 'Catat kalori & makro',
              icon: Icons.camera_alt_outlined, // Camera icon for logging
              gradient: AppGradients.fire, // Orange for Action
              onTap: () => context.push(AppRoutes.addFoodLog),
            ),
            _FeatureCard(
              width: width,
              title: 'Lihat\nProgress',
              subtitle: 'Pantau berat badan',
              icon: Icons.show_chart_rounded,
              gradient: AppGradients.blue,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Fitur Progress akan segera hadir!'),
                    backgroundColor: AppColors.primary,
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }
}

class _NutritionSummaryCard extends StatelessWidget {
  final AsyncValue<dynamic> nutritionAsync;

  const _NutritionSummaryCard({required this.nutritionAsync});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      borderRadius: 24,
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Target Kalori',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  nutritionAsync.when(
                    data: (data) => Text(
                      "${(data['caloriesConsumed'] as num).toInt()} / ${(data['calorieTarget'] as num).toInt()} kcal",
                      style: GoogleFonts.outfit(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    loading: () => const Text(
                      'Loading...',
                      style: TextStyle(fontSize: 18),
                    ),
                    error: (error, stack) => const Text('0 / 2000 kcal'),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.local_fire_department_rounded,
                  color: AppColors.primary,
                  size: 28,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: nutritionAsync.when(
                data: (data) {
                  final c = (data['caloriesConsumed'] as num).toDouble();
                  final t = (data['calorieTarget'] as num).toDouble();
                  return t > 0 ? (c / t).clamp(0.0, 1.0) : 0.0;
                },
                loading: () => 0,
                error: (error, stack) => 0,
              ),
              minHeight: 12,
              backgroundColor: AppColors.border,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 20),
          // Macros
          // Macros
          nutritionAsync.when(
            data: (data) => Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _MacroItem(
                  label: 'Protein',
                  value: "${(data['totalProtein'] as num?)?.toInt() ?? 0}g",
                  color: AppColors.info, // Blue/Info is fine for Protein
                ),
                _MacroItem(
                  label: 'Karbo',
                  value: "${(data['totalCarbs'] as num?)?.toInt() ?? 0}g",
                  color: AppColors.warning, // Orange/Yellow is fine for Carbs
                ),
                _MacroItem(
                  label: 'Lemak',
                  value: "${(data['totalFat'] as num?)?.toInt() ?? 0}g",
                  // UX Improvement: Fat is not an "Error". Using a neutral warm color.
                  color: const Color(0xFFFF8C00),
                ),
              ],
            ),
            loading: () => const SizedBox(
              height: 50,
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (error, stack) => const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _MacroItem(
                  label: 'Protein',
                  value: '-g',
                  color: AppColors.info,
                ),
                _MacroItem(
                  label: 'Karbo',
                  value: '-g',
                  color: AppColors.warning,
                ),
                _MacroItem(
                  label: 'Lemak',
                  value: '-g',
                  color: Color(0xFFFF8C00),
                ),
              ],
            ),
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
  const _MacroItem({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 6),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ],
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final double width;
  final String title;
  final String subtitle;
  final IconData icon;
  final Gradient gradient;
  final VoidCallback onTap;

  const _FeatureCard({
    required this.width,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // UX Improvement: Replaced GestureDetector with InkWell + Material
    // to provide ripple feedback when touched.
    return Container(
      width: width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: AppShadows.small,
        border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: gradient,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: gradient.colors.first.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Icon(icon, color: Colors.white, size: 24),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  title,
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StreakBanner extends StatelessWidget {
  final int streakDays;
  const _StreakBanner({required this.streakDays});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED), // Orange/Amber tint
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFEDD5)),
      ),
      child: Row(
        children: [
          const Text('🔥', style: TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              streakDays > 0
                  ? '$streakDays hari streak! Pertahankan!'
                  : 'Mulai streak pertamamu hari ini!',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          const Icon(
            Icons.arrow_forward_ios_rounded,
            size: 14,
            color: AppColors.textTertiary,
          ),
        ],
      ),
    );
  }
}
