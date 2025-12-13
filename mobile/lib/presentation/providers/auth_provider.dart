import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';
import '../../data/models/user_model.dart';

/// Auth state
class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final UserModel? user;
  final String? error;

  const AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    UserModel? user,
    String? error,
    bool clearError = false,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// Auth notifier for managing authentication state
class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient;

  AuthNotifier(this._apiClient) : super(const AuthState());

  /// Check if user is already logged in
  Future<void> checkAuthStatus() async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final hasToken = await _apiClient.hasToken();
      if (hasToken) {
        final response = await _apiClient.getMe();
        if (response.statusCode == 200) {
          final userData = response.data['data'] ?? response.data;
          final user = UserModel.fromJson(userData);
          state = state.copyWith(
            isLoading: false,
            isAuthenticated: true,
            user: user,
          );
          return;
        }
      }
      state = state.copyWith(isLoading: false, isAuthenticated: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, isAuthenticated: false);
    }
  }

  /// Login with email and password
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final response = await _apiClient.login(email, password);

      if (response.statusCode == 200) {
        final data = response.data['data'];

        // Save tokens
        await _apiClient.saveTokens(
          accessToken: data['accessToken'] ?? data['token'],
          refreshToken: data['refreshToken'],
          userId: data['userId'],
        );

        // Create user from the response data directly
        // Backend returns: {userId, email, fullName, accessToken, ...}
        // Not nested in 'user' object
        final userJson = {
          'id': data['userId'],
          'email': data['email'],
          'fullName': data['fullName'],
        };
        final user = UserModel.fromJson(userJson);

        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          user: user,
        );
        return true;
      }

      state = state.copyWith(
        isLoading: false,
        error: 'Login gagal. Coba lagi.',
      );
      return false;
    } catch (e) {
      String errorMessage = 'Email atau password salah';

      if (e is DioException) {
        if (e.type == DioExceptionType.connectionTimeout ||
            e.type == DioExceptionType.receiveTimeout ||
            e.type == DioExceptionType.connectionError ||
            e.toString().contains('SocketException')) {
          errorMessage =
              'Tidak dapat terhubung ke server. Pastikan backend berjalan.';
        } else if (e.response != null) {
          if (e.response?.statusCode == 401) {
            errorMessage = 'Email atau password salah';
          } else if (e.response?.statusCode == 404) {
            errorMessage = 'Endpoint login tidak ditemukan (404)';
          } else {
            errorMessage =
                'Terjadi kesalahan server: ${e.response?.statusCode}';
          }
        }
      } else if (e.toString().contains('SocketException') ||
          e.toString().contains('Connection')) {
        errorMessage = 'Tidak dapat terhubung ke server';
      }

      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    }
  }

  /// Register new user
  Future<bool> register(Map<String, dynamic> userData) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final response = await _apiClient.register(userData);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data['data'];

        // Save tokens
        await _apiClient.saveTokens(
          accessToken: data['accessToken'] ?? data['token'],
          refreshToken: data['refreshToken'],
          userId: data['user']?['id'],
        );

        // Get user data
        final user = UserModel.fromJson(data['user']);
        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          user: user,
        );
        return true;
      }

      // Handle non-success status codes
      String errorMessage = response.data['message'] ?? 'Registrasi gagal';
      if (response.statusCode == 409) {
        errorMessage =
            'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      }

      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    } catch (e) {
      String errorMessage = 'Registrasi gagal. Coba lagi.';

      // Check for DioException with status code
      if (e.toString().contains('409') || e.toString().contains('Conflict')) {
        errorMessage =
            'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      } else if (e.toString().contains('email')) {
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain.';
      } else if (e.toString().contains('SocketException') ||
          e.toString().contains('Connection')) {
        errorMessage =
            'Tidak dapat terhubung ke server. Cek koneksi internet Anda.';
      } else if (e.toString().contains('timeout')) {
        errorMessage = 'Koneksi timeout. Coba lagi.';
      }

      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    }
  }

  /// Update user profile
  Future<bool> updateProfile(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final response = await _apiClient.updateProfile(data);

      if (response.statusCode == 200) {
        final userData = response.data['data'] ?? response.data;
        final user = UserModel.fromJson(userData);
        state = state.copyWith(isLoading: false, user: user);
        return true;
      }

      state = state.copyWith(isLoading: false, error: 'Update gagal');
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Update gagal');
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);

    try {
      await _apiClient.logout();
    } finally {
      state = const AuthState();
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(clearError: true);
  }

  /// Refresh user data
  Future<void> refreshUser() async {
    try {
      final response = await _apiClient.getMe();
      if (response.statusCode == 200) {
        final userData = response.data['data'] ?? response.data;
        final user = UserModel.fromJson(userData);
        state = state.copyWith(user: user);
      }
    } catch (e) {
      // Silently fail - user data refresh is not critical
    }
  }
}

/// Providers
final apiClientProvider = Provider((ref) => ApiClient.instance);

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(apiClientProvider));
});

/// Convenience providers
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).user;
});

final isLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isLoading;
});
