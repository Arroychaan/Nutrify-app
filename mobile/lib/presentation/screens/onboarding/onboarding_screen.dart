import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_svg/flutter_svg.dart';
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
      title: 'Makan Enak,\nHidup Sehat',
      description: 'Tanpa perlu ninggalin rendang dan nasi padang kesukaanmu. Diet santai ala Indonesia.',
      icon: Icons.restaurant,
    ),
    OnboardingContent(
      title: 'Gak Pake\nRibet',
      description: 'Tinggal foto makananmu, biar AI yang hitung kalori dan porsinya.',
      isFlowSlide: true, 
    ),
    OnboardingContent(
      title: 'Teman Gizi\nYang Paling Ngerti',
      description: 'Bukan nyuruh makan hambar tiap hari. Kita sesuaikan sama lidah dan budget-mu.',
      icon: Icons.handshake_outlined,
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
          // Background Color
          Container(
            color: AppColors.backgroundLight,
          ),

          // Brand Pattern Overlay
          Positioned.fill(
            child: Opacity(
              opacity: 0.05,
              child: SvgPicture.asset(
                'assets/brand/Pattern-Brand.svg',
                fit: BoxFit.cover,
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
                  color: AppColors.primary.withValues(alpha: 0.15),
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
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
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
                            ? 'Gass Mulai!'
                            : 'Lanjut',
                        onPressed: _onNext,
                        gradient: _currentPage == _contents.length - 1
                            ? AppGradients.accent // Gold for start
                            : AppGradients.primary, // Terracotta for next
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
            _buildFlowVisual(context)
          else
            _buildStandardVisual(context),

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
                _buildTrustBadge(context, Icons.star, '4.8 Rating'),
                const SizedBox(width: 16),
                _buildTrustBadge(context, Icons.restaurant_menu, '10k+ Foods'),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStandardVisual(BuildContext context) {
    return Container(
      width: 240,
      height: 240,
      decoration: BoxDecoration(
        color: AppColors.surface,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.primary, width: 0.5),
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

  Widget _buildTrustBadge(BuildContext context, IconData icon, String text) {
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
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFlowVisual(BuildContext context) {
    return Column(
      children: [
        _buildFlowStep(context, 1, 'Foto', Icons.camera_alt, isFirst: true),
        _buildFlowConnector(),
        _buildFlowStep(context, 2, 'Analisa', Icons.auto_awesome),
        _buildFlowConnector(),
        _buildFlowStep(context, 3, 'Ngobar', Icons.chat_bubble_outline),
        _buildFlowConnector(),
        _buildFlowStep(context, 4, 'Sehat', Icons.favorite, isLast: true),
      ],
    );
  }

  Widget _buildFlowConnector() {
    return Container(height: 20, width: 2, color: AppColors.border);
  }

  Widget _buildFlowStep(
    BuildContext context,
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
            color: isLast ? AppColors.textLightPrimary : AppColors.secondary,
            size: 24,
          ),
        ),
        const SizedBox(width: 16),
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }
}
