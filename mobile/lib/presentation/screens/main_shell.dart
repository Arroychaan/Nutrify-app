import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../providers/router_provider.dart';

/// Main shell with floating glassmorphism bottom navigation
class MainShell extends StatelessWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  int _getSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith(AppRoutes.dashboard)) return 0;
    if (location.startsWith(AppRoutes.chat)) return 1;
    if (location.startsWith(AppRoutes.foodLog)) return 3; // Placeholder for Jurnal/Rencana
    if (location.startsWith(AppRoutes.mealPlans)) return 3; 
    if (location.startsWith(AppRoutes.profile)) return 4;
    return 0;
  }

  void _onItemTapped(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go(AppRoutes.dashboard);
        break;
      case 1:
        context.go(AppRoutes.chat);
        break;
      case 2:
        context.push(AppRoutes.addFoodLog); // Opens camera/snap
        break;
      case 3:
        context.go(AppRoutes.mealPlans);
        break;
      case 4:
        context.go(AppRoutes.profile);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _getSelectedIndex(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark 
        ? AppColors.surfaceDark.withValues(alpha: 0.9)
        : AppColors.surfaceLight.withValues(alpha: 0.9);
    final borderColor = isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.1);
    final activeColor = AppColors.primary;
    final inactiveColor = isDark ? AppColors.textDarkSecondary : AppColors.textLightSecondary;

    return Scaffold(
      extendBody: true, // Needed for floating navbar over content
      body: child,
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(40),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
              child: Container(
                height: 80,
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(40),
                  border: Border.all(
                    color: borderColor,
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _NavItem(
                      svgAsset: 'assets/icons/home-icon.svg',
                      label: 'Beranda',
                      isSelected: selectedIndex == 0,
                      onTap: () => _onItemTapped(context, 0),
                      activeColor: activeColor,
                      inactiveColor: inactiveColor,
                    ),
                    _NavItem(
                      svgAsset: 'assets/icons/ai-icon.svg',
                      label: 'Ngobar',
                      isSelected: selectedIndex == 1,
                      onTap: () => _onItemTapped(context, 1),
                      activeColor: activeColor,
                      inactiveColor: inactiveColor,
                    ),
                    _NavItem(
                      svgAsset: 'assets/icons/scan-icon.svg',
                      label: 'Snap',
                      isSelected: selectedIndex == 2,
                      onTap: () => _onItemTapped(context, 2),
                      isPrimary: true,
                    ),
                    _NavItem(
                      icon: Icons.restaurant_menu_outlined,
                      activeIcon: Icons.restaurant_menu,
                      label: 'Meja Makan',
                      isSelected: selectedIndex == 3,
                      onTap: () => _onItemTapped(context, 3),
                      activeColor: activeColor,
                      inactiveColor: inactiveColor,
                    ),
                    _NavItem(
                      svgAsset: 'assets/icons/user-icon.svg',
                      label: 'Profil',
                      isSelected: selectedIndex == 4,
                      onTap: () => _onItemTapped(context, 4),
                      activeColor: activeColor,
                      inactiveColor: inactiveColor,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatefulWidget {
  final IconData? icon;
  final IconData? activeIcon;
  final String? svgAsset;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isPrimary;
  final Color? activeColor;
  final Color? inactiveColor;

  const _NavItem({
    this.icon,
    this.activeIcon,
    this.svgAsset,
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.isPrimary = false,
    this.activeColor,
    this.inactiveColor,
  });

  @override
  State<_NavItem> createState() => _NavItemState();
}

class _NavItemState extends State<_NavItem> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.85).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    _controller.forward();
  }

  void _handleTapUp(TapUpDetails details) {
    _controller.reverse();
    widget.onTap();
  }

  void _handleTapCancel() {
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isPrimary) {
      return GestureDetector(
        onTapDown: _handleTapDown,
        onTapUp: _handleTapUp,
        onTapCancel: _handleTapCancel,
        child: ScaleTransition(
          scale: _scaleAnimation,
          child: Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: AppGradients.accent,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.secondary.withValues(alpha: 0.4),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: widget.svgAsset != null 
              ? SvgPicture.asset(
                  widget.svgAsset!,
                  colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                  width: 28,
                  height: 28,
                )
              : Icon(
                  widget.isSelected ? widget.activeIcon : widget.icon,
                  color: Colors.white,
                  size: 28,
                ),
          ),
        ),
      );
    }

    return GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      behavior: HitTestBehavior.opaque,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                child: widget.svgAsset != null
                  ? SvgPicture.asset(
                      widget.svgAsset!,
                      colorFilter: ColorFilter.mode(
                        widget.isSelected ? widget.activeColor! : widget.inactiveColor!,
                        BlendMode.srcIn,
                      ),
                      width: 24,
                      height: 24,
                    )
                  : Icon(
                      widget.isSelected ? widget.activeIcon : widget.icon,
                      color: widget.isSelected ? widget.activeColor! : widget.inactiveColor!,
                      size: 24,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                widget.label,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: widget.isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: widget.isSelected ? widget.activeColor! : widget.inactiveColor!,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
