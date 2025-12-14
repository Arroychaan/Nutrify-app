import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final double borderRadius;
  final bool hasBorder;

  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.borderRadius = 20,
    this.hasBorder = true,
  });

  @override
  Widget build(BuildContext context) {
    // Determine the Clip Behavior based on onTap
    // If onTap is null, we can just return the decoration
    // If onTap is provided, we need an InkWell

    final decoration = BoxDecoration(
      borderRadius: BorderRadius.circular(borderRadius),
      gradient: AppGradients.glass,
      // Subtle white wash for glass effect
      color: Colors.white.withValues(alpha: 0.6),
      border: hasBorder
          ? Border.all(color: Colors.white.withValues(alpha: 0.8), width: 1.5)
          : null,
      boxShadow: AppShadows.small,
    );

    // We use a ClipRRect to constrain the blur effect
    Widget content = ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: double.infinity,
          decoration: decoration,
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(borderRadius),
              highlightColor: Colors.white.withValues(alpha: 0.2),
              splashColor: Colors.white.withValues(alpha: 0.2),
              child: Padding(padding: padding, child: child),
            ),
          ),
        ),
      ),
    );

    return content;
  }
}
