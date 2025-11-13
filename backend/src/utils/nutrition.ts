/**
 * Calculate BMI from height and weight
 * @param heightCm Height in centimeters
 * @param weightKg Weight in kilograms
 * @returns BMI value
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Get BMI category
 * @param bmi BMI value
 * @returns BMI category
 */
export function getBMICategory(
  bmi: number
): 'underweight' | 'normal' | 'overweight' | 'obese' {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

/**
 * Calculate daily calorie requirement using Mifflin-St Jeor formula
 * @param ageDays Age in years
 * @param genderChar Gender ('M' or 'F')
 * @param weightKg Weight in kilograms
 * @param heightCm Height in centimeters
 * @param activityLevel Activity level multiplier
 * @returns Daily calorie requirement
 */
export function calculateDailyCalories(
  ageYears: number,
  genderChar: string,
  weightKg: number,
  heightCm: number,
  activityLevel: string
): number {
  // Mifflin-St Jeor formula
  let bmr: number;
  if (genderChar === 'M') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate macronutrient requirements based on AKG (Indonesian Dietary Guidelines)
 */
export function calculateMacroRequirements(caloriesPerDay: number): {
  proteinG: number;
  carbsG: number;
  fatG: number;
} {
  // AKG recommendations (Indonesian standard)
  // Protein: 10-15% of calories
  // Carbs: 50-60% of calories
  // Fat: 20-30% of calories

  const proteinCalories = caloriesPerDay * 0.125; // 12.5% average
  const carbsCalories = caloriesPerDay * 0.55; // 55% average
  const fatCalories = caloriesPerDay * 0.25; // 25% average

  return {
    proteinG: Math.round(proteinCalories / 4),
    carbsG: Math.round(carbsCalories / 4),
    fatG: Math.round(fatCalories / 9),
  };
}

/**
 * Get maximum sodium for hypertension patients
 * AKG recommendation: < 2000mg/day
 */
export function getMaxSodiumForHypertension(): number {
  return 2000; // mg/day
}

/**
 * Get maximum sugar for diabetes patients
 * AKG recommendation: < 50g/day (10% of calories)
 */
export function getMaxSugarForDiabetes(caloriesPerDay: number): number {
  return Math.round((caloriesPerDay * 0.1) / 4); // 4 cal per gram
}

/**
 * Calculate potassium requirement for hypertension
 * WHO recommendation: 3500-5000mg/day
 */
export function getPotassiumRequirementForHypertension(): {
  min: number;
  max: number;
} {
  return { min: 3500, max: 5000 };
}

/**
 * Calculate weight loss target
 * Safe rate: 0.5-1kg per week
 */
export function calculateWeightLossTimeline(
  currentWeightKg: number,
  targetWeightKg: number
): {
  weeksLow: number;
  weeksHigh: number;
  weeklyTargetKg: number;
} {
  const weightToLoseKg = currentWeightKg - targetWeightKg;
  const weeksLow = weightToLoseKg / 1; // 1kg per week
  const weeksHigh = weightToLoseKg / 0.5; // 0.5kg per week
  const weeklyTargetKg = 0.75; // Target 0.75kg per week (safe average)

  return {
    weeksLow: Math.round(weeksLow),
    weeksHigh: Math.round(weeksHigh),
    weeklyTargetKg,
  };
}
