import {
  INutrition,
  IUser,
  IMealPlan,
  IMeal,
  IMealDay,
  ILocalFood,
} from '../types/index.js';
import {
  calculateBMI,
  calculateDailyCalories,
  calculateMacroRequirements,
  getMaxSodiumForHypertension,
  getMaxSugarForDiabetes,
  getPotassiumRequirementForHypertension,
} from '@utils/nutrition.js';
import logger from '@config/logger.js';

export interface ComplianceResult {
  isCompliant: boolean;
  score: number; // 0-100
  violations: Violation[];
  suggestions: string[];
}

export interface Violation {
  type: 'error' | 'warning';
  rule: string;
  current: number;
  allowed: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Nutrition Logic Engine - Validates meal plans against:
 * - AKG (Indonesian Dietary Guidelines)
 * - Medical condition constraints
 * - Budget constraints
 * - Cultural preferences
 */
export class NutritionEngine {
  private user: IUser;

  constructor(user: IUser) {
    this.user = user;
  }

  /**
   * Get personalized AKG requirements based on user profile
   */
  getPersonalizedAKG(): {
    caloriesPerDay: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    sodiumMgMax: number;
    sugarGMax: number;
  } {
    const ageYears = this.calculateAge();

    // Calculate daily calorie requirement
    const caloriesPerDay = calculateDailyCalories(
      ageYears,
      this.user.gender || 'M',
      Number(this.user.currentWeightKg),
      Number(this.user.heightCm),
      this.user.activityLevel
    );

    // Calculate macro requirements
    const { proteinG, carbsG, fatG } =
      calculateMacroRequirements(caloriesPerDay);

    // Special rules for medical conditions
    let sodiumMgMax = 2300; // AKG standard
    let sugarGMax = 50; // AKG standard (10% of calories)

    if (this.user.medicalConditions.includes('Hipertensi')) {
      sodiumMgMax = getMaxSodiumForHypertension(); // 2000mg
    }

    if (this.user.medicalConditions.includes('Diabetes')) {
      sugarGMax = getMaxSugarForDiabetes(caloriesPerDay);
    }

    return {
      caloriesPerDay,
      proteinG,
      carbsG,
      fatG,
      sodiumMgMax,
      sugarGMax,
    };
  }

  /**
   * Validate single meal against constraints
   */
  validateMeal(meal: IMeal): ComplianceResult {
    const violations: Violation[] = [];
    const suggestions: string[] = [];

    // Check for allergies
    for (const allergen of this.user.allergies || []) {
      if (meal.name.toLowerCase().includes(allergen.toLowerCase())) {
        violations.push({
          type: 'error',
          rule: `Contains ${allergen} (user allergic)`,
          current: 1,
          allowed: '0',
          severity: 'critical',
        });
      }
    }

    // Check medical condition constraints
    if (this.user.medicalConditions.includes('Hipertensi')) {
      const maxSodium = getMaxSodiumForHypertension();
      if (Number(meal.nutrition.sodiumMg) > maxSodium) {
        violations.push({
          type: 'warning',
          rule: 'High sodium for hypertension patient',
          current: Number(meal.nutrition.sodiumMg),
          allowed: `<${maxSodium}mg`,
          severity: 'high',
        });

        // Suggest lower-sodium alternatives
        suggestions.push(
          `Reduce sodium by using less salt or low-sodium ingredients`
        );
      }
    }

    if (this.user.medicalConditions.includes('Diabetes')) {
      const maxSugar = 50; // simplified, should be 10% of daily calories
      if (
        meal.nutrition.sugarG &&
        Number(meal.nutrition.sugarG) > maxSugar / 3
      ) {
        violations.push({
          type: 'warning',
          rule: 'High sugar for diabetes patient',
          current: Number(meal.nutrition.sugarG || 0),
          allowed: `<${maxSugar / 3}g per meal`,
          severity: 'high',
        });

        suggestions.push(`Choose low-sugar alternatives or reduce portion`);
      }
    }

    if (this.user.medicalConditions.includes('Kolesterol')) {
      if (
        meal.nutrition.saturatedFatG &&
        Number(meal.nutrition.saturatedFatG) > 10
      ) {
        violations.push({
          type: 'warning',
          rule: 'High saturated fat for cholesterol management',
          current: Number(meal.nutrition.saturatedFatG),
          allowed: '<10g',
          severity: 'medium',
        });

        suggestions.push(
          `Choose lean proteins and healthier cooking methods`
        );
      }
    }

    // Calculate compliance score
    const score = Math.max(
      0,
      100 - violations.length * (violations[0]?.severity === 'critical' ? 20 : 10)
    );

    return {
      isCompliant: violations.length === 0,
      score,
      violations,
      suggestions,
    };
  }

  /**
   * Validate full meal plan
   */
  validateMealPlan(mealPlan: IMealPlan): ComplianceResult {
    const violations: Violation[] = [];
    const suggestions: string[] = [];

    const akgRequirements = this.getPersonalizedAKG();

    // Check daily nutrition averages
    if (
      mealPlan.avgCalories >
      akgRequirements.caloriesPerDay * 1.1
    ) {
      violations.push({
        type: 'warning',
        rule: 'Average calories exceeds AKG by >10%',
        current: mealPlan.avgCalories,
        allowed: `<${akgRequirements.caloriesPerDay * 1.1}`,
        severity: 'medium',
      });
    }

    if (mealPlan.avgSodiumMg > akgRequirements.sodiumMgMax) {
      violations.push({
        type: 'warning',
        rule: 'Average sodium exceeds AKG limit',
        current: mealPlan.avgSodiumMg,
        allowed: `<${akgRequirements.sodiumMgMax}`,
        severity: 'high',
      });

      suggestions.push('Consider lower-sodium alternatives');
    }

    // Validate local food percentage
    if (mealPlan.localFoodPercentage < 50) {
      violations.push({
        type: 'warning',
        rule: 'Local food percentage below target',
        current: mealPlan.localFoodPercentage,
        allowed: '>=60%',
        severity: 'low',
      });

      suggestions.push('Incorporate more local Indonesian foods');
    }

    // Calculate overall score
    let score = 100;
    score -= violations.filter((v) => v.severity === 'critical').length * 20;
    score -= violations.filter((v) => v.severity === 'high').length * 10;
    score -= violations.filter((v) => v.severity === 'medium').length * 5;
    score -= violations.filter((v) => v.severity === 'low').length * 2;

    score = Math.max(0, Math.min(100, score));

    return {
      isCompliant: violations.length === 0,
      score,
      violations,
      suggestions,
    };
  }

  /**
   * Get food recommendations for medical condition
   */
  getRecommendedFoods(condition: string): string[] {
    const recommendations: Record<string, string[]> = {
      Hipertensi: [
        'Kalium tinggi: pisang, bayam, ubi jalar, kacang-kacangan',
        'Rendah sodium: buah segar, sayuran hijau, ikan tenggiri',
        'Whole grains: beras coklat, gandum utuh',
        'Lemak sehat: minyak zaitun, alpukat',
      ],
      Diabetes: [
        'Indeks glikemik rendah: nasi merah, oat, kacang panjang',
        'Serat tinggi: sayuran hijau, buah berri',
        'Protein tanpa lemak: ikan, ayam tanpa kulit, tahu',
        'Hindari: gula, roti putih, makanan cepat saji',
      ],
      Obesitas: [
        'Rendah kalori: sayuran, buah, ikan',
        'Protein tinggi: telur, daging tanpa lemak, legume',
        'Serat: sayuran, biji-bijian utuh',
        'Portion control: gunakan piring lebih kecil',
      ],
      Kolesterol: [
        'Lemak sehat: ikan berminyak (salmon, mackerel)',
        'Serat soluble: oat, apel, jeruk',
        'Sterol tanaman: kacang, biji',
        'Hindari: lemak jenuh, daging merah berlemak',
      ],
    };

    return recommendations[condition] || [];
  }

  /**
   * Get foods to avoid for medical condition
   */
  getRestrictedFoods(condition: string): string[] {
    const restrictions: Record<string, string[]> = {
      Hipertensi: [
        'Makanan asin: ikan asin, telur asin, kripik',
        'Processed foods: sosis, kornet, daging asap',
        'Instant noodles, soy sauce berlebih',
        'Kaleng dengan tinggi sodium',
      ],
      Diabetes: [
        'Makanan manis: kue, permen, minuman bersoda',
        'Karbohidrat sederhana: roti putih, nasi putih',
        'Buah dengan gula tinggi (anggur, kurma)',
        'Alkohol tinggi',
      ],
      Obesitas: [
        'Makanan berlemak: gorengan, daging berlemak',
        'Makanan manis: coklat, kue, minuman bersoda',
        'Portion besar: fast food, buffet',
        'Snack kalori tinggi: chips, kue',
      ],
      Kolesterol: [
        'Lemak jenuh: mentega, gajih, daging merah',
        'Produk dairy full-fat',
        'Organ meats: hati, ginjal',
        'Telur berlebih (> 3/minggu)',
      ],
    };

    return restrictions[condition] || [];
  }

  /**
   * Calculate AKG compliance percentage
   */
  calculateAKGCompliance(mealPlan: IMealPlan): number {
    const akg = this.getPersonalizedAKG();
    let compliance = 100;

    // Calorie tolerance: ±10%
    const calorieTolerance = akg.caloriesPerDay * 0.1;
    if (
      Math.abs(mealPlan.avgCalories - akg.caloriesPerDay) >
      calorieTolerance
    ) {
      compliance -= 10;
    }

    // Protein tolerance: ±15%
    const proteinTolerance = akg.proteinG * 0.15;
    if (
      Math.abs(mealPlan.avgProteinG - akg.proteinG) >
      proteinTolerance
    ) {
      compliance -= 5;
    }

    // Sodium: must not exceed max
    if (mealPlan.avgSodiumMg > akg.sodiumMgMax) {
      compliance -= 15;
    }

    // Sugar: must not exceed max
    if (
      mealPlan.avgSugarG &&
      mealPlan.avgSugarG > akg.sugarGMax
    ) {
      compliance -= 15;
    }

    return Math.max(0, Math.min(100, compliance));
  }

  /**
   * Get personalized dietary tips
   */
  getDietaryTips(): string[] {
    const tips: string[] = [
      'Makan 3 kali sehari dengan porsi seimbang',
      'Minum minimal 8 gelas air per hari',
      'Olahraga teratur 30 menit setiap hari',
    ];

    if (this.user.medicalConditions.includes('Hipertensi')) {
      tips.push(
        'Batasi garam: maksimal 5g (1 sendok teh) per hari',
        'Tingkatkan asupan potassium dengan makan sayuran hijau',
        'Hindari makanan dalam kaleng dan processed'
      );
    }

    if (this.user.medicalConditions.includes('Diabetes')) {
      tips.push(
        'Monitor kadar gula darah secara teratur',
        'Pilih karbohidrat kompleks bukan sederhana',
        'Jangan lewatkan sarapan, makan teratur'
      );
    }

    if (this.user.medicalConditions.includes('Obesitas')) {
      tips.push(
        'Kurangi asupan kalori 300-500 kkal per hari',
        'Tingkatkan aktivitas fisik hingga 60 menit per hari',
        'Makan perlahan dan kunyah hingga 30 kali'
      );
    }

    return tips;
  }

  /**
   * Calculate user age from date of birth
   */
  private calculateAge(): number {
    if (!this.user.dateOfBirth) {
      return 35; // default age
    }

    const today = new Date();
    const birthDate = new Date(this.user.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}

export default NutritionEngine;
