import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/social_share_service.dart';

final socialShareServiceProvider = Provider<SocialShareService>((ref) {
  return SocialShareService();
});
