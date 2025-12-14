import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';

/// Provider for today's nutrition summary
final todayNutritionProvider = FutureProvider.autoDispose<Map<String, dynamic>>(
  (ref) async {
    try {
      final response = await ApiClient.instance.getTodaySummary();
      if (response.statusCode == 200 && response.data['success'] == true) {
        return response.data['data'];
      }
      // Return default empty data on failure to avoid UI breaks
      return {
        'calorieTarget': 2000,
        'caloriesConsumed': 0,
        'totalProtein': 0,
        'totalCarbs': 0,
        'totalFat': 0,
      };
    } catch (e) {
      // Return default empty data on error
      return {
        'calorieTarget': 2000,
        'caloriesConsumed': 0,
        'totalProtein': 0,
        'totalCarbs': 0,
        'totalFat': 0,
      };
    }
  },
);
