import 'package:flutter/foundation.dart';

/// API Constants for AI Ate Indonesia backend
class ApiConstants {
  // Toggle this to switch between Production and Local Development
  static const bool useProduction = true;

  // Base URLs
  static const String prodBaseUrl =
      'https://aiate-app-production.up.railway.app';

  // IP LAPTOP (Untuk Android Fisik/Emulator)
  static const String androidLocalIp = 'http://192.168.1.5:3001';

  // LOCALHOST (Untuk Web/Chrome & iOS Simulator)
  static const String localhost = 'http://localhost:3001';

  // Automatically select the correct URL based on platform
  static String get baseUrl {
    if (useProduction) {
      return prodBaseUrl;
    }

    if (kIsWeb) {
      // WEB (Chrome) WAJIB PAKAI LOCALHOST
      // Menggunakan IP di Chrome seringkali kena blokir browser/CORS/firewall
      return localhost;
    } else if (defaultTargetPlatform == TargetPlatform.android) {
      // ANDROID WAJIB PAKAI IP LAPTOP
      // Android tidak bisa akses 'localhost' laptop secara langsung
      return androidLocalIp;
    } else {
      // iOS / Desktop
      return localhost;
    }
  }

  // API Version
  static const String apiVersion = '/api/v1/';

  // Full base URL
  static String get fullBaseUrl => '$baseUrl$apiVersion';

  // Auth endpoints
  static const String login = 'auth/login';
  static const String register = 'auth/register';
  static const String refresh = 'auth/refresh';
  static const String logout = 'auth/logout';
  static const String me = 'auth/me';
  static const String updateProfile = 'auth/profile';
  static const String changePassword = 'auth/password';

  // Chat endpoints
  static const String chatMessages = 'chat/messages';
  static const String conversations = 'chat/conversations';

  // Meal Plan endpoints
  static const String mealPlans = 'meal-plans';
  static const String generateMealPlan = 'meal-plans/generate';

  // Food Log endpoints
  static const String foodLogs = 'food-logs';
  static const String foodLogsSummary = 'food-logs/summary';
  static const String foodLogsToday = 'food-logs/today';

  // Food database endpoints
  static const String foods = 'foods';
  static const String foodSearch = 'foods/search';
}

/// Storage keys for secure storage
class StorageKeys {
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userId = 'user_id';
}

/// App-wide constants
class AppConstants {
  static const String appName = 'AI Ate Indonesia';
  static const String tagline = 'AI Dietician untuk Indonesia';

  // Activity levels
  static const List<String> activityLevels = [
    'sedentary',
    'light',
    'moderate',
    'active',
    'very_active',
  ];

  static const Map<String, String> activityLevelLabels = {
    'sedentary': 'Tidak aktif (jarang olahraga)',
    'light': 'Ringan (1-2x/minggu)',
    'moderate': 'Sedang (3-4x/minggu)',
    'active': 'Aktif (5-6x/minggu)',
    'very_active': 'Sangat aktif (setiap hari)',
  };

  // Meal types
  static const List<String> mealTypes = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  static const Map<String, String> mealTypeLabels = {
    'breakfast': 'Sarapan',
    'lunch': 'Makan Siang',
    'dinner': 'Makan Malam',
    'snack': 'Camilan',
  };

  // Cultures
  static const List<String> cultures = [
    'Jawa',
    'Sunda',
    'Minang',
    'Bugis',
    'Batak',
    'Bali',
    'Betawi',
    'Lainnya',
  ];

  // Religions
  static const List<String> religions = [
    'Islam',
    'Kristen',
    'Katolik',
    'Hindu',
    'Buddha',
    'Konghucu',
    'Lainnya',
  ];

  // Common medical conditions
  static const List<String> medicalConditions = [
    'Diabetes',
    'Hipertensi',
    'Kolesterol Tinggi',
    'Asam Urat',
    'Obesitas',
    'Maag/GERD',
    'Penyakit Jantung',
    'Penyakit Ginjal',
  ];

  // Common allergies
  static const List<String> commonAllergies = [
    'Kacang',
    'Susu/Laktosa',
    'Telur',
    'Seafood',
    'Gluten',
    'Kedelai',
  ];
}
