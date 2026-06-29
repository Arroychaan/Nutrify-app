import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/router_provider.dart';
import '../../widgets/gradient_button.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingContent> _contents = [
    OnboardingContent(
      title: 'AI Nutritionist Lokal\nUntukmu',
      description:
          'Satu-satunya aplikasi diet yang paham masakan Indonesia. Sehat tanpa harus makan hambar.',
      icon: Icons.auto_awesome,
    ),
    OnboardingContent(
      title: 'Cara Kerja\nNutrify',
      description: 'Langkah mudah menuju hidup sehat.',
      isFlowSlide: true, // Special flag for the flow slide
    ),
    OnboardingContent(
      title: 'Dipercaya Komunitas\nSehat Indonesia',
      description:
          'Didukung database database makanan terlengkap. Mulai perjalanan sehatmu hari ini.',
      icon: Icons.verified_user_outlined,
      isLast: true,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onNext() {
    if (_currentPage < _contents.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      context.go(AppRoutes.login);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFFF0FDF4), Colors.white],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),

          // Background Decorative Blobs (Soft)
          Positioned(
            top: -100,
            right: -100,
            child: ImageFiltered(
              imageFilter: ImageFilter.blur(sigmaX: 50, sigmaY: 50),
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withValues(alpha: 0.2),
                ),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                // Skip Button
                Align(
                  alignment: Alignment.topRight,
                  child: TextButton(
                    onPressed: () => context.go(AppRoutes.login),
                    child: Text(
                      'Lewati',
                      style: GoogleFonts.outfit(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),

                // Page View
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (index) =>
                        setState(() => _currentPage = index),
                    itemCount: _contents.length,
                    itemBuilder: (context, index) {
                      final content = _contents[index];
                      return _OnboardingPage(content: content);
                    },
                  ),
                ),

                // Bottom Section (Indicators + CTA)
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      // Indicators
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          _contents.length,
                          (index) => AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: _currentPage == index ? 24 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: _currentPage == index
                                  ? AppColors.primary
                                  : AppColors.border,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // CTA Button
                      GradientButton(
                        text: _currentPage == _contents.length - 1
                            ? 'Mulai Perjalanan Sehatmu'
                            : 'Lanjut',
                        onPressed: _onNext,
                        gradient: _currentPage == _contents.length - 1
                            ? AppGradients
                                  .primary // Green for start
                            : AppGradients.accent, // Purple/Blue for next
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class OnboardingContent {
  final String title;
  final String description;
  final IconData? icon;
  final bool isFlowSlide;
  final bool isLast;

  OnboardingContent({
    required this.title,
    required this.description,
    this.icon,
    this.isFlowSlide = false,
    this.isLast = false,
  });
}

class _OnboardingPage extends StatelessWidget {
  final OnboardingContent content;

  const _OnboardingPage({required this.content});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Visual
          if (content.isFlowSlide)
            _buildFlowVisual()
          else
            _buildStandardVisual(),

          const SizedBox(height: 48),

          // Text Content
          Text(
            content.title,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            content.description,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.textSecondary,
              height: 1.6,
            ),
          ),

          if (content.isLast) ...[
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildTrustBadge(Icons.star, '4.8 Rating'),
                const SizedBox(width: 16),
                _buildTrustBadge(Icons.restaurant_menu, '10k+ Foods'),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStandardVisual() {
    return Container(
      width: 240,
      height: 240,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: AppShadows.large,
      ),
      child: Center(
        child: Icon(
          content.icon ?? Icons.star,
          size: 80,
          color: AppColors.primary,
        ),
      ),
    );
  }

  Widget _buildTrustBadge(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.warning),
          const SizedBox(width: 6),
          Text(
            text,
            style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildFlowVisual() {
    return Column(
      children: [
        _buildFlowStep(1, 'Daftar', Icons.person_add, isFirst: true),
        _buildFlowConnector(),
        _buildFlowStep(2, 'Scan / Input', Icons.qr_code_scanner),
        _buildFlowConnector(),
        _buildFlowStep(3, 'Analisa AI', Icons.auto_awesome),
        _buildFlowConnector(),
        _buildFlowStep(4, 'Sehat', Icons.favorite, isLast: true),
      ],
    );
  }

  Widget _buildFlowConnector() {
    return Container(height: 20, width: 2, color: AppColors.border);
  }

  Widget _buildFlowStep(
    int index,
    String label,
    IconData icon, {
    bool isFirst = false,
    bool isLast = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: isLast ? AppColors.primary : AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isLast ? AppColors.primary : AppColors.border,
            ),
            boxShadow: AppShadows.small,
          ),
          child: Icon(
            icon,
            color: isLast ? Colors.white : AppColors.secondary,
            size: 24,
          ),
        ),
        const SizedBox(width: 16),
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w600,
              fontSize: 16,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }
}
