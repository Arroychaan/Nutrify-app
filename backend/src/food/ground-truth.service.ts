import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/db.module.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema.js';
import { localFoods } from '../db/schema.js';
import { eq, or, ilike } from 'drizzle-orm';

export interface NutritionEstimate {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sodiumMg?: number;
  sugarG?: number;
}

export interface DeviationReport {
  field: string;
  llmValue: number;
  groundTruthValue: number;
  deviationPercent: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ValidationResult {
  isValid: boolean;
  confidenceScore: number; // 0-100
  source: 'ground_truth' | 'llm_validated' | 'llm_unvalidated';
  originalEstimate: NutritionEstimate;
  correctedEstimate?: NutritionEstimate;
  groundTruthData?: NutritionEstimate;
  deviations: DeviationReport[];
  matchedFoodName?: string;
  similarityScore?: number;
}

@Injectable()
export class GroundTruthService {
  private readonly logger = new Logger(GroundTruthService.name);

  private readonly CONFIG = {
    DEVIATION_THRESHOLDS: {
      LOW: 10,
      MEDIUM: 20,
      HIGH: 35,
      CRITICAL: 50,
    },
    AUTO_CORRECT_THRESHOLD: 25,
    MIN_CONFIDENCE_SCORE: 60,
    SIMILARITY_THRESHOLD: 0.6,
    CONFIDENCE_WEIGHTS: {
      nameMatch: 0.3,
      nutritionAccuracy: 0.7,
    },
  };

  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    if (m === 0) return n;
    if (n === 0) return m;

    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;

    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1;

    const distance = this.levenshteinDistance(s1, s2);
    return 1 - distance / maxLen;
  }

  private tokenBasedSimilarity(query: string, target: string): number {
    const queryTokens = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);
    const targetTokens = target
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);

    if (queryTokens.length === 0 || targetTokens.length === 0) {
      return this.calculateSimilarity(query, target);
    }

    let matchCount = 0;
    for (const qToken of queryTokens) {
      for (const tToken of targetTokens) {
        if (tToken.includes(qToken) || qToken.includes(tToken)) {
          matchCount++;
          break;
        }
      }
    }

    return matchCount / Math.max(queryTokens.length, targetTokens.length);
  }

  async findBestMatch(
    foodName: string,
  ): Promise<{ food: any; similarityScore: number } | null> {
    const searchName = foodName.toLowerCase().trim();

    // Try exact match first
    let [food] = await this.db
      .select()
      .from(localFoods)
      .where(eq(localFoods.name, searchName))
      .limit(1);

    if (food) {
      return { food, similarityScore: 1.0 };
    }

    // Try contains match
    [food] = await this.db
      .select()
      .from(localFoods)
      .where(ilike(localFoods.name, `%${searchName}%`))
      .limit(1);

    if (food) {
      const similarity = this.calculateSimilarity(searchName, food.name);
      return { food, similarityScore: Math.max(similarity, 0.8) };
    }

    // Fuzzy search
    const words = searchName.split(' ').filter((w) => w.length > 2);

    if (words.length > 0) {
      const candidates = await this.db
        .select()
        .from(localFoods)
        .where(or(...words.map((word) => ilike(localFoods.name, `%${word}%`))))
        .limit(10);

      if (candidates.length > 0) {
        let bestMatch = candidates[0];
        let bestScore = 0;

        for (const candidate of candidates) {
          const levScore = this.calculateSimilarity(searchName, candidate.name);
          const tokenScore = this.tokenBasedSimilarity(
            searchName,
            candidate.name,
          );
          const combinedScore = (levScore + tokenScore) / 2;

          if (combinedScore > bestScore) {
            bestScore = combinedScore;
            bestMatch = candidate;
          }
        }

        if (bestScore >= this.CONFIG.SIMILARITY_THRESHOLD) {
          return { food: bestMatch, similarityScore: bestScore };
        }
      }
    }

    return null;
  }

  private calculateDeviation(
    llmValue: number,
    groundTruthValue: number,
  ): { percent: number; severity: DeviationReport['severity'] } {
    if (groundTruthValue === 0) {
      return {
        percent: llmValue > 0 ? 100 : 0,
        severity: llmValue > 10 ? 'high' : 'low',
      };
    }

    const percent =
      Math.abs((llmValue - groundTruthValue) / groundTruthValue) * 100;

    let severity: DeviationReport['severity'] = 'low';
    if (percent >= this.CONFIG.DEVIATION_THRESHOLDS.CRITICAL) {
      severity = 'critical';
    } else if (percent >= this.CONFIG.DEVIATION_THRESHOLDS.HIGH) {
      severity = 'high';
    } else if (percent >= this.CONFIG.DEVIATION_THRESHOLDS.MEDIUM) {
      severity = 'medium';
    }

    return { percent, severity };
  }

  async validateNutritionEstimate(
    llmEstimate: NutritionEstimate,
  ): Promise<ValidationResult> {
    this.logger.log(`Validating estimate for food: ${llmEstimate.name}`);

    const matchResult = await this.findBestMatch(llmEstimate.name);

    if (!matchResult) {
      return {
        isValid: true,
        confidenceScore: 50,
        source: 'llm_unvalidated',
        originalEstimate: llmEstimate,
        deviations: [],
      };
    }

    const { food: groundTruth, similarityScore } = matchResult;

    const groundTruthData: NutritionEstimate = {
      name: groundTruth.name,
      calories: Number(groundTruth.calories),
      proteinG: Number(groundTruth.proteinG),
      carbsG: Number(groundTruth.carbsG),
      fatG: Number(groundTruth.fatG),
      fiberG: groundTruth.fiberG ? Number(groundTruth.fiberG) : undefined,
      sodiumMg: groundTruth.sodiumMg ? Number(groundTruth.sodiumMg) : undefined,
      sugarG: groundTruth.sugarG ? Number(groundTruth.sugarG) : undefined,
    };

    const deviations: DeviationReport[] = [];
    const nutrients = ['calories', 'proteinG', 'carbsG', 'fatG'] as const;

    let totalDeviationPercent = 0;

    for (const nutrient of nutrients) {
      const llmValue = llmEstimate[nutrient] || 0;
      const gtValue = groundTruthData[nutrient] || 0;
      const { percent, severity } = this.calculateDeviation(llmValue, gtValue);

      totalDeviationPercent += percent;

      if (percent > this.CONFIG.DEVIATION_THRESHOLDS.LOW) {
        deviations.push({
          field: nutrient,
          llmValue,
          groundTruthValue: gtValue,
          deviationPercent: Math.round(percent * 10) / 10,
          severity,
        });
      }
    }

    const avgDeviation = totalDeviationPercent / nutrients.length;

    const nutritionAccuracy = Math.max(0, 100 - avgDeviation);
    const nameMatchScore = similarityScore * 100;

    const confidenceScore = Math.round(
      this.CONFIG.CONFIDENCE_WEIGHTS.nameMatch * nameMatchScore +
        this.CONFIG.CONFIDENCE_WEIGHTS.nutritionAccuracy * nutritionAccuracy,
    );

    const shouldCorrect = avgDeviation > this.CONFIG.AUTO_CORRECT_THRESHOLD;

    let correctedEstimate: NutritionEstimate | undefined;
    if (shouldCorrect) {
      correctedEstimate = { ...groundTruthData };
    }

    const hasCriticalDeviation = deviations.some(
      (d) => d.severity === 'critical',
    );

    return {
      isValid: !hasCriticalDeviation,
      confidenceScore,
      source: shouldCorrect ? 'ground_truth' : 'llm_validated',
      originalEstimate: llmEstimate,
      correctedEstimate,
      groundTruthData,
      deviations,
      matchedFoodName: groundTruth.name,
      similarityScore: Math.round(similarityScore * 100) / 100,
    };
  }

  async getBestNutritionData(
    foodName: string,
    llmEstimate?: NutritionEstimate,
  ): Promise<{ data: NutritionEstimate; source: string; confidence: number }> {
    const matchResult = await this.findBestMatch(foodName);

    if (matchResult && matchResult.similarityScore >= 0.8) {
      const { food } = matchResult;
      return {
        data: {
          name: food.name,
          calories: Number(food.calories),
          proteinG: Number(food.proteinG),
          carbsG: Number(food.carbsG),
          fatG: Number(food.fatG),
          fiberG: food.fiberG ? Number(food.fiberG) : undefined,
          sodiumMg: food.sodiumMg ? Number(food.sodiumMg) : undefined,
          sugarG: food.sugarG ? Number(food.sugarG) : undefined,
        },
        source: 'ground_truth',
        confidence: Math.round(matchResult.similarityScore * 100),
      };
    }

    if (llmEstimate) {
      const validation = await this.validateNutritionEstimate(llmEstimate);

      return {
        data: validation.correctedEstimate || validation.originalEstimate,
        source: validation.source,
        confidence: validation.confidenceScore,
      };
    }

    throw new Error(`No nutrition data found for: ${foodName}`);
  }
}
