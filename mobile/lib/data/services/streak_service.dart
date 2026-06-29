import 'package:flutter/foundation.dart';
import '../../core/network/api_client.dart';

class StreakService {
  final ApiClient _apiClient;

  StreakService(this._apiClient);

  /// Get current streak from User Profile
  Future<int> calculateStreak() async {
    try {
      final response = await _apiClient.getMe();

      if (response.statusCode == 200) {
        final data = response.data['data'];
        if (data != null) {
          return data['streakDays'] ?? 0;
        }
      }
    } catch (e) {
      debugPrint('Error getting streak: $e');
    }
    return 0;
  }
}
