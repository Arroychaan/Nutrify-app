import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/constants.dart';

/// API Client using Dio with JWT authentication
class ApiClient {
  static ApiClient? _instance;
  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiClient._() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.fullBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _setupInterceptors();
  }

  /// Singleton instance
  static ApiClient get instance {
    _instance ??= ApiClient._();
    return _instance!;
  }

  Dio get dio => _dio;

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token to every request
          final token = await _storage.read(key: StorageKeys.accessToken);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (error, handler) async {
          // Log error for debugging
          debugPrint(
            'API ERROR: ${error.message} - ${error.response?.statusCode} - ${error.requestOptions.uri}',
          );
          if (error.response?.data != null) {
            debugPrint('ERROR DATA: ${error.response?.data}');
          }

          // Handle 401 - Token expired
          if (error.response?.statusCode == 401) {
            // Try to refresh token
            final refreshed = await _refreshToken();
            if (refreshed) {
              // Retry the original request
              final opts = error.requestOptions;
              final token = await _storage.read(key: StorageKeys.accessToken);
              opts.headers['Authorization'] = 'Bearer $token';

              try {
                final response = await _dio.fetch(opts);
                return handler.resolve(response);
              } catch (e) {
                return handler.next(error);
              }
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.read(key: StorageKeys.refreshToken);
      if (refreshToken == null) return false;

      final response = await _dio.post(
        ApiConstants.refresh,
        data: {'refreshToken': refreshToken},
        options: Options(headers: {}), // No auth header for refresh
      );

      if (response.statusCode == 200) {
        final data = response.data['data'];
        await _storage.write(
          key: StorageKeys.accessToken,
          value: data['accessToken'],
        );
        if (data['refreshToken'] != null) {
          await _storage.write(
            key: StorageKeys.refreshToken,
            value: data['refreshToken'],
          );
        }
        return true;
      }
    } catch (e) {
      // Refresh failed - user needs to login again
    }
    return false;
  }

  // === Auth Methods ===

  Future<Response> login(String email, String password) async {
    // Trim both email and password to remove accidental whitespace
    final trimmedEmail = email.trim().toLowerCase();
    final trimmedPassword = password.trim();

    // Debug log (REMOVE IN PRODUCTION)
    // print(
    //   'DEBUG LOGIN: Sending to ${ApiConstants.fullBaseUrl}${ApiConstants.login}',
    // );
    // print('DEBUG LOGIN: Email = "$trimmedEmail"');
    // print('DEBUG LOGIN: Password length = ${trimmedPassword.length}');

    return _dio.post(
      ApiConstants.login,
      data: {'email': trimmedEmail, 'password': trimmedPassword},
    );
  }

  Future<Response> register(Map<String, dynamic> userData) async {
    return _dio.post(ApiConstants.register, data: userData);
  }

  Future<Response> getMe() async {
    return _dio.get(ApiConstants.me);
  }

  Future<Response> updateProfile(Map<String, dynamic> data) async {
    return _dio.put(ApiConstants.updateProfile, data: data);
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiConstants.logout);
    } finally {
      await _storage.delete(key: StorageKeys.accessToken);
      await _storage.delete(key: StorageKeys.refreshToken);
      await _storage.delete(key: StorageKeys.userId);
    }
  }

  // === Meal Plan Methods ===

  Future<Response> getMealPlans() async {
    return _dio.get(ApiConstants.mealPlans);
  }

  Future<Response> getMealPlan(String id) async {
    return _dio.get('${ApiConstants.mealPlans}/$id');
  }

  Future<Response> generateMealPlan(Map<String, dynamic> options) async {
    return _dio.post(ApiConstants.generateMealPlan, data: options);
  }

  Future<Response> rateMealPlan(
    String id,
    Map<String, dynamic> feedback,
  ) async {
    return _dio.put('${ApiConstants.mealPlans}/$id/feedback', data: feedback);
  }

  // === Chat Methods ===

  Future<Response> sendChatMessage(
    String message, {
    String? conversationId,
  }) async {
    return _dio.post(
      ApiConstants.chatMessages,
      data: {
        'message': message,
        if (conversationId != null) 'conversationId': conversationId,
      },
    );
  }

  Future<Response> getConversations() async {
    return _dio.get(ApiConstants.conversations);
  }

  Future<Response> getConversation(String id) async {
    return _dio.get('${ApiConstants.conversations}/$id');
  }

  // === Food Log Methods ===

  Future<Response> createFoodLog(Map<String, dynamic> data) async {
    return _dio.post(ApiConstants.foodLogs, data: data);
  }

  Future<Response> getFoodLogs({String? date}) async {
    return _dio.get(
      ApiConstants.foodLogs,
      queryParameters: date != null ? {'date': date} : null,
    );
  }

  Future<Response> getTodaySummary() async {
    return _dio.get(ApiConstants.foodLogsToday);
  }

  Future<Response> updateFoodLog(String id, Map<String, dynamic> data) async {
    return _dio.put('${ApiConstants.foodLogs}/$id', data: data);
  }

  Future<Response> deleteFoodLog(String id) async {
    return _dio.delete('${ApiConstants.foodLogs}/$id');
  }

  // === Food Database Methods ===

  Future<Response> searchFoods(String query) async {
    return _dio.get(ApiConstants.foodSearch, queryParameters: {'q': query});
  }

  // === Storage Helper Methods ===

  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
    String? userId,
  }) async {
    await _storage.write(key: StorageKeys.accessToken, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: StorageKeys.refreshToken, value: refreshToken);
    }
    if (userId != null) {
      await _storage.write(key: StorageKeys.userId, value: userId);
    }
  }

  Future<String?> getAccessToken() async {
    return _storage.read(key: StorageKeys.accessToken);
  }

  Future<bool> hasToken() async {
    final token = await _storage.read(key: StorageKeys.accessToken);
    return token != null && token.isNotEmpty;
  }
}
