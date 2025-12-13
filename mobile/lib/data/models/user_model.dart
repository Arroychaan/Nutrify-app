/// User model matching backend User schema
class UserModel {
  final String id;
  final String email;
  final String fullName;
  final DateTime? dateOfBirth;
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
  final List<String> dislikes;
  final int streakDays;
  final List<String> badges;
  final DateTime createdAt;

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
    this.dislikes = const [],
    this.streakDays = 0,
    this.badges = const [],
    required this.createdAt,
  });

  /// Calculate BMI
  double get bmi {
    final heightM = heightCm / 100;
    return currentWeightKg / (heightM * heightM);
  }

  /// Get BMI category in Indonesian
  String get bmiCategory {
    if (bmi < 18.5) return 'Kurus';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Gemuk';
    return 'Obesitas';
  }

  /// Get age from date of birth
  int? get age {
    if (dateOfBirth == null) return null;
    final now = DateTime.now();
    int age = now.year - dateOfBirth!.year;
    if (now.month < dateOfBirth!.month ||
        (now.month == dateOfBirth!.month && now.day < dateOfBirth!.day)) {
      age--;
    }
    return age;
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? '',
      dateOfBirth: json['dateOfBirth'] != null 
          ? DateTime.tryParse(json['dateOfBirth']) 
          : null,
      gender: json['gender'],
      phoneNumber: json['phoneNumber'],
      heightCm: _parseDouble(json['heightCm']),
      currentWeightKg: _parseDouble(json['currentWeightKg']),
      targetWeightKg: json['targetWeightKg'] != null 
          ? _parseDouble(json['targetWeightKg']) 
          : null,
      activityLevel: json['activityLevel'] ?? 'moderate',
      culture: json['culture'],
      religion: json['religion'],
      medicalConditions: _parseStringList(json['medicalConditions']),
      allergies: _parseStringList(json['allergies']),
      dietaryRestrictions: _parseStringList(json['dietaryRestrictions']),
      dislikes: _parseStringList(json['dislikes']),
      streakDays: json['streakDays'] ?? 0,
      badges: _parseStringList(json['badges']),
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'phoneNumber': phoneNumber,
      'heightCm': heightCm,
      'currentWeightKg': currentWeightKg,
      'targetWeightKg': targetWeightKg,
      'activityLevel': activityLevel,
      'culture': culture,
      'religion': religion,
      'medicalConditions': medicalConditions,
      'allergies': allergies,
      'dietaryRestrictions': dietaryRestrictions,
      'dislikes': dislikes,
      'streakDays': streakDays,
      'badges': badges,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? fullName,
    DateTime? dateOfBirth,
    String? gender,
    String? phoneNumber,
    double? heightCm,
    double? currentWeightKg,
    double? targetWeightKg,
    String? activityLevel,
    String? culture,
    String? religion,
    List<String>? medicalConditions,
    List<String>? allergies,
    List<String>? dietaryRestrictions,
    List<String>? dislikes,
    int? streakDays,
    List<String>? badges,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      heightCm: heightCm ?? this.heightCm,
      currentWeightKg: currentWeightKg ?? this.currentWeightKg,
      targetWeightKg: targetWeightKg ?? this.targetWeightKg,
      activityLevel: activityLevel ?? this.activityLevel,
      culture: culture ?? this.culture,
      religion: religion ?? this.religion,
      medicalConditions: medicalConditions ?? this.medicalConditions,
      allergies: allergies ?? this.allergies,
      dietaryRestrictions: dietaryRestrictions ?? this.dietaryRestrictions,
      dislikes: dislikes ?? this.dislikes,
      streakDays: streakDays ?? this.streakDays,
      badges: badges ?? this.badges,
      createdAt: createdAt,
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  static List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
  }
}
