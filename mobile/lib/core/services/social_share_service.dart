import 'dart:io';
import 'package:flutter/widgets.dart';
import 'package:path_provider/path_provider.dart';
import 'package:screenshot/screenshot.dart';
import 'package:share_plus/share_plus.dart';

class SocialShareService {
  final ScreenshotController screenshotController = ScreenshotController();

  /// Captures a widget and shares it to external apps
  Future<void> shareWidget({
    required Widget widget,
    required BuildContext context,
    String text = 'Check out my progress on AI Ate Indonesia! 🚀',
  }) async {
    try {
      // Capture the widget as an image
      // We pass 2.0 pixel ratio for higher quality
      final imageBytes = await screenshotController.captureFromWidget(
        widget,
        context: context,
        pixelRatio: 2.0,
        delay: const Duration(milliseconds: 100),
      );

      // Get temp directory
      final tempDir = await getTemporaryDirectory();
      final fileName =
          'aiate_share_${DateTime.now().millisecondsSinceEpoch}.png';
      final file = File('${tempDir.path}/$fileName');

      // Write bytes to file
      await file.writeAsBytes(imageBytes);

      // Share the file
      await SharePlus.instance.share(
        ShareParams(text: text, files: [XFile(file.path)]),
      );
    } catch (e) {
      debugPrint('Error sharing widget: $e');
      throw Exception('Gagal membagikan konten');
    }
  }
}
