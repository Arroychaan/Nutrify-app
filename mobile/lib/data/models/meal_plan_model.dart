/// Meal Plan model
class MealPlanModel {
  final String id;
  final String userId;
  final DateTime startDate;
  final DateTime endDate;
  final String duration; // 1_day, 3_days, 7_days, etc.
  final double avgCalories;
  final double avgProteinG;
  final double avgCarbsG;
  final double avgFatG;
  final double avgSodiumMg;
  final double? avgSugarG;
  final double akgCompliance;
  final double localFoodPercentage;
  final double medicalSafetyScore;
  final double? userRating;
  final String? userFeedback;
  final DateTime createdAt;
  final List<MealPlanDayModel> days;

  MealPlanModel({
    required this.id,
    required this.userId,
    required this.startDate,
    required this.endDate,
    required this.duration,
    required this.avgCalories,
    required this.avgProteinG,
    required this.avgCarbsG,
    required this.avgFatG,
    required this.avgSodiumMg,
    this.avgSugarG,
    required this.akgCompliance,
    required this.localFoodPercentage,
    required this.medicalSafetyScore,
    this.userRating,
    this.userFeedback,
    required this.createdAt,
    this.days = const [],
  });

  /// Get duration in days
  int get durationDays {
    switch (duration) {
      case '1_day':
        return 1;
      case '3_days':
        return 3;
      case '7_days':
        return 7;
      case '14_days':
        return 14;
      case '28_days':
        return 28;
      default:
        return 1;
    }
  }

  /// Get human readable duration
  String get durationLabel {
    switch (duration) {
      case '1_day':
        return '1 Hari';
      case '3_days':
        return '3 Hari';
      case '7_days':
        return '1 Minggu';
      case '14_days':
        return '2 Minggu';
      case '28_days':
        return '4 Minggu';
      default:
        return duration;
    }
  }

  factory MealPlanModel.fromJson(Map<String, dynamic> json) {
    return MealPlanModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      startDate: DateTime.tryParse(json['startDate'] ?? '') ?? DateTime.now(),
      endDate: DateTime.tryParse(json['endDate'] ?? '') ?? DateTime.now(),
      duration: json['duration'] ?? '1_day',
      avgCalories: _parseDouble(json['avgCalories']),
      avgProteinG: _parseDouble(json['avgProteinG']),
      avgCarbsG: _parseDouble(json['avgCarbsG']),
      avgFatG: _parseDouble(json['avgFatG']),
      avgSodiumMg: _parseDouble(json['avgSodiumMg']),
      avgSugarG: json['avgSugarG'] != null ? _parseDouble(json['avgSugarG']) : null,
      akgCompliance: _parseDouble(json['akgCompliance']),
      localFoodPercentage: _parseDouble(json['localFoodPercentage']),
      medicalSafetyScore: _parseDouble(json['medicalSafetyScore']),
      userRating: json['userRating'] != null ? _parseDouble(json['userRating']) : null,
      userFeedback: json['userFeedback'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      days: (json['days'] as List<dynamic>?)
              ?.map((d) => MealPlanDayModel.fromJson(d))
              .toList() ??
          [],
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}

/// Single day in meal plan
class MealPlanDayModel {
  final String id;
  final DateTime mealDate;
  final String? dayNotes;
  final List<MealModel> meals;

  MealPlanDayModel({
    required this.id,
    required this.mealDate,
    this.dayNotes,
    this.meals = const [],
  });

  /// Get meals by type
  List<MealModel> getMealsByType(String type) {
    return meals.where((m) => m.mealType == type).toList();
  }

  MealModel? get breakfast => meals.firstWhere(
        (m) => m.mealType == 'breakfast',
        orElse: () => MealModel.empty(),
      );

  MealModel? get lunch => meals.firstWhere(
        (m) => m.mealType == 'lunch',
        orElse: () => MealModel.empty(),
      );

  MealModel? get dinner => meals.firstWhere(
        (m) => m.mealType == 'dinner',
        orElse: () => MealModel.empty(),
      );

  List<MealModel> get snacks => meals.where((m) => m.mealType == 'snack').toList();

  factory MealPlanDayModel.fromJson(Map<String, dynamic> json) {
    // Handle nested meals structure
    List<MealModel> parsedMeals = [];
    if (json['meals'] != null) {
      for (var mealData in json['meals']) {
        // If meals are wrapped in MealPlanDayMeal structure
        if (mealData['meal'] != null) {
          final meal = MealModel.fromJson(mealData['meal']);
          parsedMeals.add(meal.copyWith(mealType: mealData['mealType']));
        } else {
          parsedMeals.add(MealModel.fromJson(mealData));
        }
      }
    }

    return MealPlanDayModel(
      id: json['id'] ?? '',
      mealDate: DateTime.tryParse(json['mealDate'] ?? '') ?? DateTime.now(),
      dayNotes: json['dayNotes'],
      meals: parsedMeals,
    );
  }
}

/// Individual meal
class MealModel {
  final String id;
  final String name;
  final String? description;
  final String portion;
  final String mealType;
  final double calories;
  final double proteinG;
  final double carbsG;
  final double fatG;
  final double? fiberG;
  final double sodiumMg;
  final double? sugarG;
  final bool isLocalFood;
  final String? preparationTips;
  final String? culturalSignificance;

  MealModel({
    required this.id,
    required this.name,
    this.description,
    required this.portion,
    required this.mealType,
    required this.calories,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
    this.fiberG,
    required this.sodiumMg,
    this.sugarG,
    this.isLocalFood = true,
    this.preparationTips,
    this.culturalSignificance,
  });

  factory MealModel.empty() {
    return MealModel(
      id: '',
      name: '',
      portion: '',
      mealType: '',
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      sodiumMg: 0,
    );
  }

  bool get isEmpty => id.isEmpty;

  MealModel copyWith({String? mealType}) {
    return MealModel(
      id: id,
      name: name,
      description: description,
      portion: portion,
      mealType: mealType ?? this.mealType,
      calories: calories,
      proteinG: proteinG,
      carbsG: carbsG,
      fatG: fatG,
      fiberG: fiberG,
      sodiumMg: sodiumMg,
      sugarG: sugarG,
      isLocalFood: isLocalFood,
      preparationTips: preparationTips,
      culturalSignificance: culturalSignificance,
    );
  }

  factory MealModel.fromJson(Map<String, dynamic> json) {
    return MealModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      portion: json['portion'] ?? '',
      mealType: json['mealType'] ?? '',
      calories: _parseDouble(json['calories']),
      proteinG: _parseDouble(json['proteinG']),
      carbsG: _parseDouble(json['carbsG']),
      fatG: _parseDouble(json['fatG']),
      fiberG: json['fiberG'] != null ? _parseDouble(json['fiberG']) : null,
      sodiumMg: _parseDouble(json['sodiumMg']),
      sugarG: json['sugarG'] != null ? _parseDouble(json['sugarG']) : null,
      isLocalFood: json['isLocalFood'] ?? true,
      preparationTips: json['preparationTips'],
      culturalSignificance: json['culturalSignificance'],
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}
