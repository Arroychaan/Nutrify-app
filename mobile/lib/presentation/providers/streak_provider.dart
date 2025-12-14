import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/streak_service.dart';
import 'auth_provider.dart';

/// Provider for StreakService
final streakServiceProvider = Provider((ref) {
  return StreakService(ref.watch(apiClientProvider));
});

/// Provider for the Streak value
final streakProvider = StateNotifierProvider<StreakNotifier, AsyncValue<int>>((
  ref,
) {
  return StreakNotifier(ref);
});

class StreakNotifier extends StateNotifier<AsyncValue<int>> {
  final Ref _ref;

  StreakNotifier(this._ref) : super(const AsyncValue.loading()) {
    // Initial fetch
    refreshStreak();
  }

  Future<void> refreshStreak() async {
    try {
      final service = _ref.read(streakServiceProvider);
      // Don't set loading state on refresh to avoid UI flicker
      // state = const AsyncValue.loading();

      final streak = await service.calculateStreak();
      state = AsyncValue.data(streak);

      // Sync with backend/user profile
      _syncWithProfile(streak);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> _syncWithProfile(int streak) async {
    final user = _ref.read(currentUserProvider);
    if (user != null && user.streakDays != streak) {
      // Update backend
      await _ref.read(authProvider.notifier).updateProfile({
        'streakDays': streak,
      });
    }
  }
}
