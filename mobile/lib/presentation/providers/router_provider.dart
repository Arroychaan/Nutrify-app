import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../screens/onboarding/onboarding_screen.dart';
import '../screens/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/meal_plan/meal_plan_list_screen.dart';
import '../screens/meal_plan/generate_meal_plan_screen.dart';
import '../screens/meal_plan/meal_plan_detail_screen.dart';
import '../screens/chat/chat_screen.dart';
import '../screens/food_log/food_log_screen.dart';
import '../screens/food_log/add_food_log_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/edit_profile_screen.dart';
import '../screens/main_shell.dart';
import 'auth_provider.dart';

/// Route paths
class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String dashboard = '/dashboard';
  static const String mealPlans = '/meal-plans';
  static const String generateMealPlan = '/meal-plans/generate';
  static const String mealPlanDetail = '/meal-plans/:id';
  static const String chat = '/chat';
  static const String foodLog = '/food-log';
  static const String addFoodLog = '/food-log/add';
  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';
  static const String onboarding = '/onboarding';
}

/// Router refresh notifier for Riverpod integration
class RouterRefreshNotifier extends ChangeNotifier {
  RouterRefreshNotifier(Ref ref) {
    ref.listen(authProvider, (_, _) => notifyListeners());
  }
}

final routerRefreshProvider = Provider((ref) => RouterRefreshNotifier(ref));

/// Router provider
final routerProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = ref.watch(routerRefreshProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    refreshListenable: refreshNotifier,
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isLoggedIn = authState.isAuthenticated;
      final isLoading = authState.isLoading;
      final currentPath = state.uri.path;

      // On splash screen
      if (currentPath == AppRoutes.splash) {
        // Stay on splash while loading
        if (isLoading) {
          return null;
        }
        // After loading, redirect based on auth state
        return isLoggedIn ? AppRoutes.dashboard : AppRoutes.login;
      }

      // Auth routes (login and register only)
      final isAuthRoute =
          currentPath == AppRoutes.login || currentPath == AppRoutes.register;

      // If logged in and on auth route, go to dashboard
      if (isLoggedIn && isAuthRoute) {
        return AppRoutes.dashboard;
      }

      // If not logged in and not on auth route, go to login
      if (!isLoggedIn && !isAuthRoute) {
        // If not logged in, go to onboarding (which leads to login)
        if (currentPath == AppRoutes.onboarding) return null;
        return AppRoutes.onboarding;
      }

      return null;
    },
    routes: [
      // Splash
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),

      // Auth routes
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => const RegisterScreen(),
      ),

      // Onboarding
      GoRoute(
        path: AppRoutes.onboarding,
        builder: (context, state) => const OnboardingScreen(),
      ),

      // Main app with shell (bottom nav)
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.dashboard,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: DashboardScreen()),
          ),
          GoRoute(
            path: AppRoutes.mealPlans,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: MealPlanListScreen()),
          ),
          GoRoute(
            path: AppRoutes.chat,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ChatScreen()),
          ),
          GoRoute(
            path: AppRoutes.foodLog,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: FoodLogScreen()),
          ),
          GoRoute(
            path: AppRoutes.profile,
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ProfileScreen()),
          ),
        ],
      ),

      // Detail routes (outside shell)
      GoRoute(
        path: AppRoutes.generateMealPlan,
        builder: (context, state) => const GenerateMealPlanScreen(),
      ),
      GoRoute(
        path: AppRoutes.mealPlanDetail,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return MealPlanDetailScreen(mealPlanId: id);
        },
      ),
      GoRoute(
        path: AppRoutes.addFoodLog,
        builder: (context, state) => const AddFoodLogScreen(),
      ),
      GoRoute(
        path: AppRoutes.editProfile,
        builder: (context, state) => const EditProfileScreen(),
      ),
    ],
  );
});
