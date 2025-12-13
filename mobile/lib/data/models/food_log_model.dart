/// Food log entry model
class FoodLogModel {
  final String id;
  final String userId;
  final String mealType; // breakfast, lunch, dinner, snack
  final String foodName;
  final String? portion;
  final double? calories;
  final double? proteinG;
  final double? carbsG;
  final double? fatG;
  final double? fiberG;
  final double? sodiumMg;
  final double? sugarG;
  final DateTime loggedAt;
  final String? notes;
  final String? imageUrl;
  final String source; // manual, chat, meal_plan

  FoodLogModel({
    required this.id,
    required this.userId,
    required this.mealType,
    required this.foodName,
    this.portion,
    this.calories,
    this.proteinG,
    this.carbsG,
    this.fatG,
    this.fiberG,
    this.sodiumMg,
    this.sugarG,
    required this.loggedAt,
    this.notes,
    this.imageUrl,
    this.source = 'manual',
  });

  factory FoodLogModel.fromJson(Map<String, dynamic> json) {
    return FoodLogModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      mealType: json['mealType'] ?? 'snack',
      foodName: json['foodName'] ?? '',
      portion: json['portion'],
      calories: _parseDouble(json['calories']),
      proteinG: _parseDouble(json['proteinG']),
      carbsG: _parseDouble(json['carbsG']),
      fatG: _parseDouble(json['fatG']),
      fiberG: _parseDouble(json['fiberG']),
      sodiumMg: _parseDouble(json['sodiumMg']),
      sugarG: _parseDouble(json['sugarG']),
      loggedAt: DateTime.tryParse(json['loggedAt'] ?? '') ?? DateTime.now(),
      notes: json['notes'],
      imageUrl: json['imageUrl'],
      source: json['source'] ?? 'manual',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'mealType': mealType,
      'foodName': foodName,
      'portion': portion,
      'calories': calories,
      'proteinG': proteinG,
      'carbsG': carbsG,
      'fatG': fatG,
      'fiberG': fiberG,
      'sodiumMg': sodiumMg,
      'sugarG': sugarG,
      'notes': notes,
      'source': source,
    };
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

/// Daily nutrition summary
class DailySummaryModel {
  final DateTime date;
  final double totalCalories;
  final double totalProtein;
  final double totalCarbs;
  final double totalFat;
  final double targetCalories;
  final List<FoodLogModel> logs;

  DailySummaryModel({
    required this.date,
    required this.totalCalories,
    required this.totalProtein,
    required this.totalCarbs,
    required this.totalFat,
    required this.targetCalories,
    this.logs = const [],
  });

  double get calorieProgress => targetCalories > 0 
      ? (totalCalories / targetCalories).clamp(0.0, 1.5) 
      : 0.0;

  double get remainingCalories => targetCalories - totalCalories;

  factory DailySummaryModel.fromJson(Map<String, dynamic> json) {
    return DailySummaryModel(
      date: DateTime.tryParse(json['date'] ?? '') ?? DateTime.now(),
      totalCalories: _parseDouble(json['totalCalories']) ?? 0,
      totalProtein: _parseDouble(json['totalProtein']) ?? 0,
      totalCarbs: _parseDouble(json['totalCarbs']) ?? 0,
      totalFat: _parseDouble(json['totalFat']) ?? 0,
      targetCalories: _parseDouble(json['targetCalories']) ?? 2000,
      logs: (json['logs'] as List<dynamic>?)
              ?.map((l) => FoodLogModel.fromJson(l))
              .toList() ??
          [],
    );
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}
