import 'package:flutter/foundation.dart';
import '../../core/network/api_client.dart';
import '../models/food_log_model.dart';

class StreakService {
  final ApiClient _apiClient;

  StreakService(this._apiClient);

  /// Calculate current streak based on food logs
  Future<int> calculateStreak() async {
    try {
      // Fetch all logs (assuming API returns list of recent logs)
      // Ideally this should support pagination or date range
      final response = await _apiClient.getFoodLogs();

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? [];
        final logs = data.map((json) => FoodLogModel.fromJson(json)).toList();

        return _calculateConsecutiveDays(logs);
      }
    } catch (e) {
      debugPrint('Error calculating streak: $e');
    }
    return 0;
  }

  /// Internal logic for counting consecutive days
  int _calculateConsecutiveDays(List<FoodLogModel> logs) {
    if (logs.isEmpty) return 0;

    // Extract unique dates (normalized to YYYY-MM-DD)
    final Set<String> uniqueDates = {};
    for (var log in logs) {
      final date = log.loggedAt;
      // Format: YYYY-MM-DD
      final dateStr =
          '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      uniqueDates.add(dateStr);
    }

    if (uniqueDates.isEmpty) return 0;

    // Convert to sorted list of DateTimes
    final sortedDates = uniqueDates.map((d) => DateTime.parse(d)).toList()
      ..sort((a, b) => b.compareTo(a)); // Newest first

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));

    // Check if streak is active (logged today or yesterday)
    bool isStreakActive = false;
    if (sortedDates.isNotEmpty) {
      final latest = sortedDates.first;
      if (latest.isAtSameMomentAs(today) ||
          latest.isAtSameMomentAs(yesterday)) {
        isStreakActive = true;
      }
    }

    if (!isStreakActive) return 0;

    int streak = 0;
    // We start checking from today. If today is missing, we check if yesterday exists (which we established it does if streak is active)
    DateTime currentCheck = today;

    // If today is NOT in list, but yesterday IS (implied by isStreakActive),
    // we effectively start counting from yesterday.
    // However, the loop logic:
    // Check Today -> Exists? Streak++ -> Next Yesterday
    // Check Yesterday -> Exists? Streak++ -> ...

    // Optimization: Just iterate backwards from today
    while (true) {
      // Check if this date exists in our logs
      // We use string comparison safely
      final checkStr =
          '${currentCheck.year}-${currentCheck.month.toString().padLeft(2, '0')}-${currentCheck.day.toString().padLeft(2, '0')}';

      if (uniqueDates.contains(checkStr)) {
        streak++;
      } else {
        // If it's TODAY and it's missing, it doesn't break the streak yet (as long as yesterday exists)
        // But if we are checking any day prior to today and it's missing, it breaks.
        if (!currentCheck.isAtSameMomentAs(today)) {
          break;
        }
      }

      currentCheck = currentCheck.subtract(const Duration(days: 1));

      // Safety break
      if (streak > 3650) break;
    }

    return streak;
  }
}
