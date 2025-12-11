# 🚀 NUTRIFY FLUTTER - GUIDE LENGKAP: DARI 0 SAMPAI PLAY STORE

> **Estimasi Waktu Total:** 6-10 Minggu (1 developer)  
> **Target:** Rilis Nutrify sebagai native Android app di Google Play Store  
> **Tech Stack:** Flutter + Existing Backend (Express.js + PostgreSQL)

---

## 📋 TABLE OF CONTENTS

1. [Phase 0: Persiapan Environment](#phase-0-persiapan-environment)
2. [Phase 1: Setup Project Flutter](#phase-1-setup-project-flutter)
3. [Phase 2: Arsitektur & Struktur Project](#phase-2-arsitektur--struktur-project)
4. [Phase 3: Implementasi Core Features](#phase-3-implementasi-core-features)
5. [Phase 4: Integrasi dengan Backend](#phase-4-integrasi-dengan-backend)
6. [Phase 5: UI/UX Implementation](#phase-5-uiux-implementation)
7. [Phase 6: Testing & Debugging](#phase-6-testing--debugging)
8. [Phase 7: Build & Release Preparation](#phase-7-build--release-preparation)
9. [Phase 8: Google Play Console Setup](#phase-8-google-play-console-setup)
10. [Phase 9: Upload ke Play Store](#phase-9-upload-ke-play-store)
11. [Phase 10: Post-Release](#phase-10-post-release)

---

## 🎯 PHASE 0: PERSIAPAN ENVIRONMENT

### A. Software yang Harus Diinstall

#### 1. Flutter SDK
```powershell
# Download Flutter SDK dari https://docs.flutter.dev/get-started/install/windows

# Extract ke folder (misal C:\flutter)
# Jangan taruh di folder yang butuh admin permission

# Tambahkan ke PATH environment variable
# System Properties > Environment Variables > Path > Add:
C:\flutter\bin
```

#### 2. Android Studio
```
1. Download dari: https://developer.android.com/studio
2. Install dengan default settings
3. Buka Android Studio > More Actions > SDK Manager
4. Install:
   - Android SDK Platform 34 (Android 14)
   - Android SDK Command-line Tools
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools
```

#### 3. Flutter Plugin di Android Studio
```
1. Buka Android Studio
2. File > Settings > Plugins
3. Search "Flutter" > Install
4. Restart Android Studio
```

#### 4. Visual Studio Code (Opsional tapi Recommended)
```
1. Install VS Code
2. Install extension: Flutter, Dart
```

### B. Verifikasi Instalasi

```powershell
# Cek Flutter installation
flutter doctor -v

# Harusnya output seperti ini:
# [✓] Flutter (Channel stable, 3.x.x)
# [✓] Android toolchain
# [✓] Android Studio
# [✓] VS Code (opsional)
# [✓] Connected device
```

### C. Accept Android Licenses
```powershell
flutter doctor --android-licenses
# Ketik 'y' untuk semua
```

### D. Setup Android Emulator
```
1. Android Studio > More Actions > Virtual Device Manager
2. Create Device > Pilih Pixel 7 (atau device lain)
3. Download system image (API 34)
4. Finish
5. Klik Play untuk jalankan emulator
```

---

## 🏗️ PHASE 1: SETUP PROJECT FLUTTER

### A. Buat Project Baru

```powershell
# Masuk ke folder nutrify
cd "D:\Achmad Roychan\UNISSULA\biomedis\nutrify"

# Buat Flutter project
flutter create --org com.nutrify --project-name nutrify_app mobile

# Masuk ke folder project
cd mobile

# Buka di VS Code atau Android Studio
code .
# atau
start android-studio64.exe .
```

### B. Update pubspec.yaml

```yaml
name: nutrify_app
description: AI Dietician untuk Indonesia - Personalized Meal Planning

publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3

  # Networking
  dio: ^5.4.0
  retrofit: ^4.0.3
  json_annotation: ^4.8.1

  # Local Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  hive_flutter: ^1.1.0

  # UI Components
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1
  shimmer: ^3.0.0
  fl_chart: ^0.66.0
  lottie: ^3.0.0

  # Navigation
  go_router: ^13.0.1

  # Forms & Validation
  flutter_form_builder: ^9.1.1
  form_builder_validators: ^9.1.0

  # Notifications
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0

  # Utils
  intl: ^0.19.0
  url_launcher: ^6.2.2
  package_info_plus: ^5.0.1
  connectivity_plus: ^5.0.2

  # Icons
  cupertino_icons: ^1.0.6
  flutter_launcher_icons: ^0.13.1

dev_dependencies:
  flutter_test:
    sdk: flutter

  # Code Generation
  build_runner: ^2.4.8
  retrofit_generator: ^8.0.6
  json_serializable: ^6.7.1
  riverpod_generator: ^2.3.9

  # Linting
  flutter_lints: ^3.0.1

  # Icons & Splash
  flutter_native_splash: ^2.3.8

flutter:
  uses-material-design: true

  assets:
    - assets/images/
    - assets/icons/
    - assets/animations/

  fonts:
    - family: Poppins
      fonts:
        - asset: assets/fonts/Poppins-Regular.ttf
        - asset: assets/fonts/Poppins-Medium.ttf
          weight: 500
        - asset: assets/fonts/Poppins-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Poppins-Bold.ttf
          weight: 700

# App Icon Configuration
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icons/app_icon.png"
  adaptive_icon_background: "#24B47E"
  adaptive_icon_foreground: "assets/icons/app_icon_foreground.png"

# Splash Screen Configuration
flutter_native_splash:
  color: "#24B47E"
  image: assets/images/splash_logo.png
  android: true
  ios: true
```

### C. Install Dependencies

```powershell
flutter pub get
```

### D. Buat Folder Structure

```powershell
# Jalankan di folder mobile/
mkdir lib\core\constants
mkdir lib\core\theme
mkdir lib\core\utils
mkdir lib\core\network
mkdir lib\core\errors
mkdir lib\data\models
mkdir lib\data\repositories
mkdir lib\data\datasources\local
mkdir lib\data\datasources\remote
mkdir lib\domain\entities
mkdir lib\domain\repositories
mkdir lib\domain\usecases
mkdir lib\presentation\screens\auth
mkdir lib\presentation\screens\dashboard
mkdir lib\presentation\screens\meal_plan
mkdir lib\presentation\screens\chat
mkdir lib\presentation\screens\profile
mkdir lib\presentation\screens\food_log
mkdir lib\presentation\widgets\common
mkdir lib\presentation\widgets\charts
mkdir lib\presentation\providers
mkdir assets\images
mkdir assets\icons
mkdir assets\fonts
mkdir assets\animations
```

---

## 🏛️ PHASE 2: ARSITEKTUR & STRUKTUR PROJECT

### A. Final Folder Structure

```
mobile/
├── lib/
│   ├── main.dart                      # Entry point
│   ├── app.dart                       # App configuration
│   │
│   ├── core/
│   │   ├── constants/
│   │   │   ├── api_constants.dart     # API URLs
│   │   │   ├── app_constants.dart     # App-wide constants
│   │   │   └── storage_keys.dart      # Local storage keys
│   │   │
│   │   ├── theme/
│   │   │   ├── app_theme.dart         # Theme configuration
│   │   │   ├── app_colors.dart        # Color palette
│   │   │   └── app_typography.dart    # Text styles
│   │   │
│   │   ├── network/
│   │   │   ├── dio_client.dart        # HTTP client setup
│   │   │   ├── api_interceptor.dart   # Auth interceptor
│   │   │   └── network_info.dart      # Connectivity checker
│   │   │
│   │   ├── errors/
│   │   │   ├── exceptions.dart        # Custom exceptions
│   │   │   └── failures.dart          # Failure classes
│   │   │
│   │   └── utils/
│   │       ├── validators.dart        # Form validators
│   │       ├── formatters.dart        # Data formatters
│   │       └── helpers.dart           # Helper functions
│   │
│   ├── data/
│   │   ├── models/                    # Data Transfer Objects
│   │   │   ├── user_model.dart
│   │   │   ├── meal_plan_model.dart
│   │   │   ├── food_model.dart
│   │   │   ├── chat_message_model.dart
│   │   │   └── food_log_model.dart
│   │   │
│   │   ├── datasources/
│   │   │   ├── local/
│   │   │   │   ├── user_local_ds.dart
│   │   │   │   └── cache_local_ds.dart
│   │   │   │
│   │   │   └── remote/
│   │   │       ├── auth_remote_ds.dart
│   │   │       ├── meal_plan_remote_ds.dart
│   │   │       ├── chat_remote_ds.dart
│   │   │       └── food_remote_ds.dart
│   │   │
│   │   └── repositories/              # Repository implementations
│   │       ├── auth_repository_impl.dart
│   │       ├── meal_plan_repository_impl.dart
│   │       └── food_repository_impl.dart
│   │
│   ├── domain/
│   │   ├── entities/                  # Business entities
│   │   │   ├── user.dart
│   │   │   ├── meal_plan.dart
│   │   │   └── food.dart
│   │   │
│   │   ├── repositories/              # Abstract repositories
│   │   │   ├── auth_repository.dart
│   │   │   └── meal_plan_repository.dart
│   │   │
│   │   └── usecases/                  # Business logic
│   │       ├── auth/
│   │       │   ├── login_usecase.dart
│   │       │   └── register_usecase.dart
│   │       └── meal_plan/
│   │           └── generate_meal_plan_usecase.dart
│   │
│   └── presentation/
│       ├── providers/                 # Riverpod providers
│       │   ├── auth_provider.dart
│       │   ├── user_provider.dart
│       │   ├── meal_plan_provider.dart
│       │   └── chat_provider.dart
│       │
│       ├── screens/
│       │   ├── splash_screen.dart
│       │   ├── auth/
│       │   │   ├── login_screen.dart
│       │   │   └── register_screen.dart
│       │   │
│       │   ├── dashboard/
│       │   │   ├── dashboard_screen.dart
│       │   │   └── widgets/
│       │   │       ├── bmi_card.dart
│       │   │       ├── stats_card.dart
│       │   │       └── quick_actions.dart
│       │   │
│       │   ├── meal_plan/
│       │   │   ├── meal_plan_screen.dart
│       │   │   ├── meal_plan_detail_screen.dart
│       │   │   └── widgets/
│       │   │       └── meal_card.dart
│       │   │
│       │   ├── chat/
│       │   │   ├── chat_screen.dart
│       │   │   └── widgets/
│       │   │       ├── message_bubble.dart
│       │   │       └── chat_input.dart
│       │   │
│       │   ├── food_log/
│       │   │   ├── food_log_screen.dart
│       │   │   └── add_food_log_screen.dart
│       │   │
│       │   └── profile/
│       │       ├── profile_screen.dart
│       │       └── edit_profile_screen.dart
│       │
│       └── widgets/
│           ├── common/
│           │   ├── app_button.dart
│           │   ├── app_text_field.dart
│           │   ├── loading_indicator.dart
│           │   ├── error_widget.dart
│           │   └── app_bar.dart
│           │
│           └── charts/
│               ├── nutrition_chart.dart
│               ├── bmi_gauge.dart
│               └── calorie_progress.dart
│
├── assets/
│   ├── images/
│   │   ├── splash_logo.png
│   │   ├── onboarding_1.png
│   │   └── empty_state.png
│   │
│   ├── icons/
│   │   ├── app_icon.png              # 1024x1024
│   │   ├── app_icon_foreground.png   # Adaptive icon
│   │   └── ...
│   │
│   ├── fonts/
│   │   ├── Poppins-Regular.ttf
│   │   ├── Poppins-Medium.ttf
│   │   ├── Poppins-SemiBold.ttf
│   │   └── Poppins-Bold.ttf
│   │
│   └── animations/
│       ├── loading.json              # Lottie animations
│       └── success.json
│
├── android/
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── res/                   # App icons
│   │
│   └── build.gradle
│
├── pubspec.yaml
└── README.md
```

### B. Core Files Implementation

#### 1. lib/core/constants/api_constants.dart
```dart
class ApiConstants {
  // Base URLs
  static const String baseUrl = 'https://nutrify-api.railway.app'; // Production
  static const String devBaseUrl = 'http://10.0.2.2:3001'; // Android Emulator
  
  // API Version
  static const String apiVersion = '/api/v1';
  
  // Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  static const String updateProfile = '/auth/profile';
  
  static const String mealPlans = '/meal-plans';
  static const String generateMealPlan = '/meal-plans/generate';
  
  static const String chat = '/chat';
  static const String chatHistory = '/chat/history';
  
  static const String foods = '/foods';
  static const String foodSearch = '/foods/search';
  
  static const String foodLogs = '/food-logs';
  
  // Full URL helper
  static String get fullBaseUrl => '$baseUrl$apiVersion';
}
```

#### 2. lib/core/theme/app_colors.dart
```dart
import 'package:flutter/material.dart';

class AppColors {
  // Primary - Nutrify Green
  static const Color primary = Color(0xFF24B47E);
  static const Color primaryLight = Color(0xFF4ECBA0);
  static const Color primaryDark = Color(0xFF1A8A5E);
  
  // Secondary
  static const Color secondary = Color(0xFF6366F1);
  static const Color secondaryLight = Color(0xFF818CF8);
  
  // Neutrals
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFF94A3B8);
  static const Color border = Color(0xFFE2E8F0);
  
  // Status Colors
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // BMI Colors
  static const Color bmiUnderweight = Color(0xFFEAB308);
  static const Color bmiNormal = Color(0xFF22C55E);
  static const Color bmiOverweight = Color(0xFFF97316);
  static const Color bmiObese = Color(0xFFEF4444);
  
  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
```

#### 3. lib/core/network/dio_client.dart
```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';

class DioClient {
  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  DioClient() {
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
    
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token
          final token = await _storage.read(key: 'token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Token expired - logout user
            await _storage.delete(key: 'token');
            // Navigate to login
          }
          return handler.next(error);
        },
      ),
    );
  }
  
  Dio get dio => _dio;
  
  // GET request
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.get(path, queryParameters: queryParameters);
  }
  
  // POST request
  Future<Response> post(
    String path, {
    dynamic data,
  }) async {
    return _dio.post(path, data: data);
  }
  
  // PUT request
  Future<Response> put(
    String path, {
    dynamic data,
  }) async {
    return _dio.put(path, data: data);
  }
  
  // DELETE request
  Future<Response> delete(String path) async {
    return _dio.delete(path);
  }
}
```

---

## 💻 PHASE 3: IMPLEMENTASI CORE FEATURES

### A. Authentication

#### 1. lib/data/models/user_model.dart
```dart
import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String? dateOfBirth;
  final String? gender;
  final String? phoneNumber;
  final double heightCm;
  final double currentWeightKg;
  final double? targetWeightKg;
  final String activityLevel;
  final String? culture;
  final String? religion;
  final List<String> medicalConditions;
  final List<String> allergies;
  final List<String> dietaryRestrictions;
  final int streakDays;
  final List<String> badges;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.dateOfBirth,
    this.gender,
    this.phoneNumber,
    required this.heightCm,
    required this.currentWeightKg,
    this.targetWeightKg,
    required this.activityLevel,
    this.culture,
    this.religion,
    this.medicalConditions = const [],
    this.allergies = const [],
    this.dietaryRestrictions = const [],
    this.streakDays = 0,
    this.badges = const [],
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => 
      _$UserModelFromJson(json);
  
  Map<String, dynamic> toJson() => _$UserModelToJson(this);
  
  // Calculate BMI
  double get bmi {
    final heightM = heightCm / 100;
    return currentWeightKg / (heightM * heightM);
  }
  
  String get bmiCategory {
    if (bmi < 18.5) return 'Kurus';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Gemuk';
    return 'Obesitas';
  }
}
```

#### 2. lib/presentation/providers/auth_provider.dart
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/api_constants.dart';
import '../../data/models/user_model.dart';

// Auth state
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final UserModel? user;
  final String? error;

  AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    UserModel? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: error,
    );
  }
}

// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final DioClient _dioClient;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthNotifier(this._dioClient) : super(AuthState());

  // Check if user is logged in
  Future<void> checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final token = await _storage.read(key: 'token');
      if (token != null) {
        final response = await _dioClient.get(ApiConstants.me);
        final userData = response.data['data'] ?? response.data;
        final user = UserModel.fromJson(userData);
        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          user: user,
        );
      } else {
        state = state.copyWith(isAuthenticated: false, isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isAuthenticated: false, isLoading: false);
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final response = await _dioClient.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );
      
      final token = response.data['data']['token'];
      await _storage.write(key: 'token', value: token);
      
      // Get user data
      await checkAuthStatus();
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Email atau password salah',
      );
      return false;
    }
  }

  // Register
  Future<bool> register(Map<String, dynamic> userData) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final response = await _dioClient.post(
        ApiConstants.register,
        data: userData,
      );
      
      final token = response.data['data']['token'];
      await _storage.write(key: 'token', value: token);
      
      await checkAuthStatus();
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Gagal mendaftar. Coba lagi.',
      );
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    await _storage.delete(key: 'token');
    state = AuthState();
  }
}

// Providers
final dioClientProvider = Provider((ref) => DioClient());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(dioClientProvider));
});
```

#### 3. lib/presentation/screens/auth/login_screen.dart
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      final success = await ref.read(authProvider.notifier).login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      
      if (success && mounted) {
        context.go('/dashboard');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 60),
                
                // Logo
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Center(
                    child: Text(
                      'N',
                      style: TextStyle(
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Title
                const Text(
                  'Selamat Datang! 👋',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Masuk untuk melanjutkan journey sehatmu',
                  style: TextStyle(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                  ),
                ),
                
                const SizedBox(height: 40),
                
                // Email field
                AppTextField(
                  controller: _emailController,
                  label: 'Email',
                  hint: 'nama@email.com',
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: Icons.email_outlined,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Email wajib diisi';
                    }
                    if (!value.contains('@')) {
                      return 'Email tidak valid';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Password field
                AppTextField(
                  controller: _passwordController,
                  label: 'Password',
                  hint: '••••••••',
                  obscureText: _obscurePassword,
                  prefixIcon: Icons.lock_outlined,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword 
                        ? Icons.visibility_outlined 
                        : Icons.visibility_off_outlined,
                    ),
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Password wajib diisi';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 24),
                
                // Error message
                if (authState.error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      authState.error!,
                      style: const TextStyle(color: AppColors.error),
                    ),
                  ),
                
                const SizedBox(height: 24),
                
                // Login button
                AppButton(
                  text: 'Masuk',
                  onPressed: _handleLogin,
                  isLoading: authState.isLoading,
                ),
                
                const SizedBox(height: 24),
                
                // Register link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Belum punya akun? ',
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                    TextButton(
                      onPressed: () => context.push('/auth/register'),
                      child: const Text(
                        'Daftar',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

---

## 🔌 PHASE 4: INTEGRASI DENGAN BACKEND

### A. Backend Sudah Ready

Backend kamu yang existing **TETAP DIPAKAI**. Flutter app akan consume API dari:

```
Production: https://nutrify-api.railway.app/api/v1
Development: http://10.0.2.2:3001/api/v1 (untuk Android Emulator)
```

> **Note:** `10.0.2.2` adalah IP localhost dari perspektif Android Emulator

### B. API Endpoints yang Harus Di-consume

| Feature | Method | Endpoint |
|---------|--------|----------|
| Login | POST | `/auth/login` |
| Register | POST | `/auth/register` |
| Get Profile | GET | `/auth/me` |
| Update Profile | PUT | `/auth/profile` |
| List Meal Plans | GET | `/meal-plans` |
| Generate Meal Plan | POST | `/meal-plans/generate` |
| Chat | POST | `/chat` |
| Search Food | GET | `/foods/search?q=xxx` |
| Add Food Log | POST | `/food-logs` |
| Get Food Logs | GET | `/food-logs?date=xxx` |

### C. Testing API Connection

```dart
// Test di main.dart sementara
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Test API connection
  final dio = Dio();
  try {
    final response = await dio.get('http://10.0.2.2:3001/api/v1/health');
    print('API Connected: ${response.data}');
  } catch (e) {
    print('API Error: $e');
  }
  
  runApp(const MyApp());
}
```

---

## 🎨 PHASE 5: UI/UX IMPLEMENTATION

### A. Common Widgets

#### lib/presentation/widgets/common/app_button.dart
```dart
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final IconData? icon;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 56,
      child: isOutlined
          ? OutlinedButton(
              onPressed: isLoading ? null : onPressed,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primary, width: 2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _buildChild(),
            )
          : ElevatedButton(
              onPressed: isLoading ? null : onPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: _buildChild(),
            ),
    );
  }

  Widget _buildChild() {
    if (isLoading) {
      return const SizedBox(
        width: 24,
        height: 24,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
        ),
      );
    }
    
    if (icon != null) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 8),
          Text(
            text,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      );
    }
    
    return Text(
      text,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
      ),
    );
  }
}
```

#### lib/presentation/widgets/common/app_text_field.dart
```dart
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class AppTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final bool obscureText;
  final TextInputType keyboardType;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  final String? Function(String?)? validator;
  final int maxLines;

  const AppTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.prefixIcon,
    this.suffixIcon,
    this.validator,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          validator: validator,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.textTertiary),
            prefixIcon: prefixIcon != null 
              ? Icon(prefixIcon, color: AppColors.textSecondary)
              : null,
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.error),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
          ),
        ),
      ],
    );
  }
}
```

### B. Dashboard Screen

```dart
// lib/presentation/screens/dashboard/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import 'widgets/bmi_card.dart';
import 'widgets/stats_card.dart';
import 'widgets/quick_actions.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    
    if (user == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting
              Text(
                'Hai ${user.fullName.split(' ')[0]} 👋',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'BMI kamu hari ini ${user.bmi.toStringAsFixed(1)}. '
                '${user.bmiCategory == 'Normal' ? 'Pertahankan! 💪' : 'Terus usaha! 🔥'}',
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textSecondary,
                ),
              ),
              
              const SizedBox(height: 24),
              
              // BMI Card
              BMICard(bmi: user.bmi, category: user.bmiCategory),
              
              const SizedBox(height: 16),
              
              // Stats Row
              Row(
                children: [
                  Expanded(
                    child: StatsCard(
                      title: 'Meal Plans',
                      value: '5',
                      icon: Icons.restaurant_menu,
                      color: AppColors.secondary,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatsCard(
                      title: 'Streak',
                      value: '${user.streakDays}',
                      icon: Icons.local_fire_department,
                      color: AppColors.warning,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Quick Actions
              const Text(
                'Aksi Cepat',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              const QuickActions(),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 🧪 PHASE 6: TESTING & DEBUGGING

### A. Unit Tests

```dart
// test/auth_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:nutrify_app/data/models/user_model.dart';

void main() {
  group('UserModel', () {
    test('should calculate BMI correctly', () {
      final user = UserModel(
        id: '1',
        email: 'test@test.com',
        fullName: 'Test User',
        heightCm: 170,
        currentWeightKg: 70,
        activityLevel: 'moderate',
      );
      
      expect(user.bmi, closeTo(24.22, 0.01));
      expect(user.bmiCategory, 'Normal');
    });
  });
}
```

### B. Run Tests

```powershell
# Run all tests
flutter test

# Run with coverage
flutter test --coverage
```

### C. Debug di Emulator

```powershell
# List devices
flutter devices

# Run di emulator
flutter run

# Run dengan hot reload enabled
flutter run --debug
```

---

## 📦 PHASE 7: BUILD & RELEASE PREPARATION

### A. Update android/app/build.gradle

```gradle
android {
    namespace "com.nutrify.nutrify_app"
    compileSdk 34
    
    defaultConfig {
        applicationId "com.nutrify.app"  // PENTING: Unique ID
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            storeFile file('../keystore/nutrify-release.jks')
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: 'your_password'
            keyAlias 'nutrify'
            keyPassword System.getenv("KEY_PASSWORD") ?: 'your_password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### B. Generate Keystore (PENTING!)

```powershell
# Buat folder keystore
mkdir android\keystore

# Generate keystore (SIMPAN PASSWORD BAIK-BAIK!)
keytool -genkey -v -keystore android\keystore\nutrify-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias nutrify

# Input:
# - Keystore password: [buat password kuat]
# - Key password: [sama dengan keystore password]
# - Nama: Achmad Roychan
# - Organization: UNISSULA
# - City: Semarang
# - State: Jawa Tengah
# - Country: ID
```

> ⚠️ **BACKUP KEYSTORE FILE!** Kalau hilang, kamu TIDAK BISA update app di Play Store!

### C. Create key.properties

```properties
# android/key.properties (JANGAN COMMIT KE GIT!)
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=nutrify
storeFile=../keystore/nutrify-release.jks
```

### D. Update .gitignore

```gitignore
# Keystore
*.jks
*.keystore
key.properties
```

### E. Build APK & AAB

```powershell
# Build APK (untuk testing)
flutter build apk --release

# Build AAB (untuk Play Store) - WAJIB AAB!
flutter build appbundle --release

# Output:
# APK: build/app/outputs/flutter-apk/app-release.apk
# AAB: build/app/outputs/bundle/release/app-release.aab
```

### F. Generate App Icons

```powershell
# Pastikan ada file assets/icons/app_icon.png (1024x1024)
flutter pub run flutter_launcher_icons
```

### G. Generate Splash Screen

```powershell
flutter pub run flutter_native_splash:create
```

---

## 🏪 PHASE 8: GOOGLE PLAY CONSOLE SETUP

### A. Daftar Google Play Developer Account

```
1. Buka: https://play.google.com/console/signup
2. Login dengan Google Account
3. Bayar one-time fee: $25 USD
4. Verifikasi identity
5. Tunggu approval (1-2 hari)
```

### B. Buat App di Play Console

```
1. Dashboard > Create App
2. Isi informasi:
   - App name: Nutrify - AI Dietician Indonesia
   - Default language: Bahasa Indonesia
   - App or Game: App
   - Free or Paid: Free
3. Accept policies
4. Create
```

### C. Setup Store Listing

#### App Details
```
App name: Nutrify - AI Dietician Indonesia
Short description (80 chars):
AI Ahli Gizi untuk meal plan personal, sesuai AKG Indonesia & makanan lokal.

Full description (4000 chars):
🥗 Nutrify - AI Dietician untuk Indonesia

Nutrify adalah aplikasi AI Ahli Gizi yang dirancang khusus untuk masyarakat Indonesia. Dapatkan rekomendasi meal plan personal berdasarkan kondisi medis, budaya, dan preferensi makanan lokal.

✨ FITUR UTAMA:

🤖 AI Chatbot Ahli Gizi
• Konsultasi nutrisi kapan saja
• Edukasi gizi berbasis AKG Indonesia
• Jawaban personal sesuai kondisi kesehatan

🍽️ Meal Plan Generator
• Meal plan otomatis 1-28 hari
• Sesuai kebutuhan kalori harian
• Support kondisi medis (Diabetes, Hipertensi, dll)
• Budget-friendly

🇮🇩 Fokus Makanan Indonesia
• Database 1346+ makanan lokal
• 60%+ rekomendasi makanan Indonesia
• Sesuai budaya & preferensi

📊 Health Tracking
• Monitor BMI
• Tracking biomarker (gula darah, kolesterol)
• Progress visualization

💰 GRATIS sepenuhnya!

Download sekarang dan mulai journey sehat kamu! 🎯
```

#### Graphics
```
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Phone screenshots: min 2, max 8 (1080x1920 atau 1920x1080)
- 7-inch tablet screenshots (opsional)
- 10-inch tablet screenshots (opsional)
```

### D. Content Rating

```
1. Start questionnaire
2. Pilih kategori: UTILITY > HEALTH & FITNESS
3. Jawab pertanyaan tentang konten
4. Submit untuk rating
5. Biasanya dapat: PEGI 3 / Everyone
```

### E. Target Audience

```
1. Target age: 18 and over
2. Tidak appeal ke children
3. Submit
```

### F. Data Safety

```
1. Pilih data yang dikumpulkan:
   - Account info (email, name)
   - Health info (weight, height, medical conditions)
   
2. Data usage:
   - App functionality
   - Analytics
   
3. Data security:
   - Data encrypted in transit: Yes
   - Data can be deleted: Yes (user request)
   
4. Submit
```

---

## ⬆️ PHASE 9: UPLOAD KE PLAY STORE

### A. Create Release

```
1. Play Console > Release > Production
2. Create new release
3. Upload app bundle (.aab file)
4. Add release notes:
   
   Apa yang baru di versi 1.0.0:
   • 🎉 Rilis pertama Nutrify!
   • 🤖 AI Chatbot untuk konsultasi gizi
   • 🍽️ Meal Plan Generator otomatis
   • 📊 BMI & Health tracking
   • 🇮🇩 Database 1346 makanan Indonesia
   
5. Review release
6. Start rollout to Production
```

### B. Review Process

```
Timeline:
- First review: 3-7 hari (bisa lebih lama)
- Subsequent updates: 1-3 hari

Status:
- Pending publication: Sedang di-review
- Published: Live di Play Store 🎉
- Rejected: Ada issue, perbaiki dan submit ulang
```

### C. Common Rejection Reasons & Solutions

| Issue | Solution |
|-------|----------|
| Privacy policy missing | Tambahkan link privacy policy |
| Deceptive behavior | Pastikan app sesuai description |
| Health claims | Tambahkan disclaimer "bukan pengganti dokter" |
| Broken functionality | Test semua fitur sebelum submit |
| Insufficient content | Pastikan app punya value jelas |

---

## 🚀 PHASE 10: POST-RELEASE

### A. Monitor Performance

```
Play Console > Statistics
- Installs
- Ratings & reviews
- Crashes & ANRs
- User acquisition
```

### B. Respond to Reviews

```
Play Console > Ratings and reviews
- Respond to user feedback
- Thank positive reviews
- Address negative reviews professionally
```

### C. Release Updates

```powershell
# Update version di pubspec.yaml
version: 1.1.0+2  # major.minor.patch+buildNumber

# Build new AAB
flutter build appbundle --release

# Upload ke Play Console > Release > Production
```

### D. Marketing & Promotion

```
1. Share di social media
2. Buat video demo di YouTube
3. Submit ke tech blogs Indonesia
4. Optimize ASO (App Store Optimization):
   - Keywords di description
   - Good screenshots
   - Respond to reviews
```

---

## 📋 CHECKLIST FINAL

### Before Submission
- [ ] App icon 512x512 ready
- [ ] Feature graphic 1024x500 ready
- [ ] Min 4 screenshots ready
- [ ] Privacy policy URL ready
- [ ] Keystore backed up
- [ ] APK tested on real device
- [ ] All features working
- [ ] No placeholder content
- [ ] Proper error handling
- [ ] Offline handling

### Play Console Setup
- [ ] App created
- [ ] Store listing complete
- [ ] Content rating done
- [ ] Data safety done
- [ ] Target audience set
- [ ] App bundle uploaded
- [ ] Release notes added

### Post-Launch
- [ ] Monitor crashes
- [ ] Respond to reviews
- [ ] Plan next update

---

## ⏱️ TIMELINE SUMMARY

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 0: Environment Setup | 1 hari | ⬜ |
| Phase 1: Project Setup | 1 hari | ⬜ |
| Phase 2: Architecture | 2 hari | ⬜ |
| Phase 3: Core Features | 2 minggu | ⬜ |
| Phase 4: API Integration | 1 minggu | ⬜ |
| Phase 5: UI Implementation | 2 minggu | ⬜ |
| Phase 6: Testing | 1 minggu | ⬜ |
| Phase 7: Build Preparation | 2 hari | ⬜ |
| Phase 8: Play Console Setup | 1 hari | ⬜ |
| Phase 9: Upload & Review | 3-7 hari | ⬜ |
| **TOTAL** | **6-10 minggu** | |

---

## 🆘 TROUBLESHOOTING

### Flutter Doctor Issues
```powershell
# Android licenses not accepted
flutter doctor --android-licenses

# Android SDK not found
# Set ANDROID_HOME environment variable

# cmdline-tools not installed
# Android Studio > SDK Manager > SDK Tools > Android SDK Command-line Tools
```

### Build Errors
```powershell
# Clean build
flutter clean
flutter pub get
flutter build appbundle --release

# Gradle issues
cd android
./gradlew clean
cd ..
flutter build appbundle --release
```

### Emulator tidak muncul
```powershell
# List emulators
flutter emulators

# Launch emulator
flutter emulators --launch <emulator_id>
```

---

## 📚 RESOURCES

- [Flutter Official Docs](https://docs.flutter.dev)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [Material Design 3](https://m3.material.io)
- [Riverpod Documentation](https://riverpod.dev)

---

**Good luck bro! 🚀 Kalau ada pertanyaan, tanya aja!**
