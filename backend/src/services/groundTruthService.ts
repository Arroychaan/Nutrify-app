/**
 * Ground Truth Validation Service
 * 
 * This service validates LLM-generated nutrition data against our verified
 * nutrition database (WHO/Indonesian nutrition dataset) as the ground truth.
 * 
 * Key Features:
 * - Validates LLM nutrition estimates against database
 * - Calculates confidence scores for responses
 * - Auto-corrects deviations beyond threshold
 * - Logs accuracy metrics for monitoring
 * - Provides fuzzy matching with similarity scoring
 */

import prisma from '@config/prisma.js';
import logger from '@config/logger.js';

// ============================================
// Types & Interfaces
// ============================================

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

export interface DeviationReport {
    field: string;
    llmValue: number;
    groundTruthValue: number;
    deviationPercent: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AccuracyMetrics {
    totalValidations: number;
    matchedCount: number;
    averageConfidenceScore: number;
    averageDeviation: Record<string, number>;
    highAccuracyCount: number;
    lowAccuracyCount: number;
}

// ============================================
// Configuration
// ============================================

const CONFIG = {
    // Deviation thresholds (percentage)
    DEVIATION_THRESHOLDS: {
        LOW: 10,      // <10% deviation = good
        MEDIUM: 20,   // 10-20% = acceptable
        HIGH: 35,     // 20-35% = concerning
        CRITICAL: 50, // >35% = needs correction
    },

    // Auto-correction threshold
    AUTO_CORRECT_THRESHOLD: 25, // Auto-correct if deviation > 25%

    // Minimum confidence for LLM estimates
    MIN_CONFIDENCE_SCORE: 60,

    // Similarity thresholds for fuzzy matching
    SIMILARITY_THRESHOLD: 0.6, // Minimum 60% match for food name

    // Weights for confidence calculation
    CONFIDENCE_WEIGHTS: {
        nameMatch: 0.3,
        nutritionAccuracy: 0.7,
    },
};

// ============================================
// Fuzzy Matching Utilities
// ============================================

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    if (m === 0) return n;
    if (n === 0) return m;

    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

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

/**
 * Calculate similarity score between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;

    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1;

    const distance = levenshteinDistance(s1, s2);
    return 1 - distance / maxLen;
}

/**
 * Tokenize and compare food names for better matching
 */
function tokenBasedSimilarity(query: string, target: string): number {
    const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const targetTokens = target.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    if (queryTokens.length === 0 || targetTokens.length === 0) {
        return calculateSimilarity(query, target);
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

// ============================================
// Core Ground Truth Functions
// ============================================

/**
 * Find the best matching food in database with similarity score
 */
export async function findBestMatch(
    foodName: string
): Promise<{ food: any; similarityScore: number } | null> {
    const searchName = foodName.toLowerCase().trim();

    // Try exact match first
    let food = await prisma.localFood.findFirst({
        where: {
            name: { equals: searchName, mode: 'insensitive' },
        },
    });

    if (food) {
        return { food, similarityScore: 1.0 };
    }

    // Try contains match
    food = await prisma.localFood.findFirst({
        where: {
            name: { contains: searchName, mode: 'insensitive' },
        },
    });

    if (food) {
        const similarity = calculateSimilarity(searchName, food.name);
        return { food, similarityScore: Math.max(similarity, 0.8) };
    }

    // Fuzzy search - get candidates and score them
    const words = searchName.split(' ').filter(w => w.length > 2);

    if (words.length > 0) {
        const candidates = await prisma.localFood.findMany({
            where: {
                OR: words.map(word => ({
                    name: { contains: word, mode: 'insensitive' },
                })),
            },
            take: 10,
        });

        if (candidates.length > 0) {
            // Score each candidate
            let bestMatch = candidates[0];
            let bestScore = 0;

            for (const candidate of candidates) {
                const levScore = calculateSimilarity(searchName, candidate.name);
                const tokenScore = tokenBasedSimilarity(searchName, candidate.name);
                const combinedScore = (levScore + tokenScore) / 2;

                if (combinedScore > bestScore) {
                    bestScore = combinedScore;
                    bestMatch = candidate;
                }
            }

            if (bestScore >= CONFIG.SIMILARITY_THRESHOLD) {
                return { food: bestMatch, similarityScore: bestScore };
            }
        }
    }

    return null;
}

/**
 * Calculate deviation between LLM estimate and ground truth
 */
function calculateDeviation(
    llmValue: number,
    groundTruthValue: number
): { percent: number; severity: DeviationReport['severity'] } {
    if (groundTruthValue === 0) {
        return {
            percent: llmValue > 0 ? 100 : 0,
            severity: llmValue > 10 ? 'high' : 'low'
        };
    }

    const percent = Math.abs((llmValue - groundTruthValue) / groundTruthValue) * 100;

    let severity: DeviationReport['severity'] = 'low';
    if (percent >= CONFIG.DEVIATION_THRESHOLDS.CRITICAL) {
        severity = 'critical';
    } else if (percent >= CONFIG.DEVIATION_THRESHOLDS.HIGH) {
        severity = 'high';
    } else if (percent >= CONFIG.DEVIATION_THRESHOLDS.MEDIUM) {
        severity = 'medium';
    }

    return { percent, severity };
}

/**
 * Validate LLM nutrition estimate against ground truth database
 */
export async function validateNutritionEstimate(
    llmEstimate: NutritionEstimate
): Promise<ValidationResult> {
    logger.info('Validating LLM estimate against ground truth', {
        foodName: llmEstimate.name,
    });

    const matchResult = await findBestMatch(llmEstimate.name);

    if (!matchResult) {
        // No ground truth found - return unvalidated
        logger.warn('No ground truth match found', { foodName: llmEstimate.name });
        return {
            isValid: true,
            confidenceScore: 50, // Lower confidence for unvalidated
            source: 'llm_unvalidated',
            originalEstimate: llmEstimate,
            deviations: [],
        };
    }

    const { food: groundTruth, similarityScore } = matchResult;

    // Build ground truth estimate
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

    // Calculate deviations for each nutrient
    const deviations: DeviationReport[] = [];
    const nutrients = ['calories', 'proteinG', 'carbsG', 'fatG'] as const;

    let totalDeviationPercent = 0;

    for (const nutrient of nutrients) {
        const llmValue = llmEstimate[nutrient] || 0;
        const gtValue = groundTruthData[nutrient] || 0;
        const { percent, severity } = calculateDeviation(llmValue, gtValue);

        totalDeviationPercent += percent;

        if (percent > CONFIG.DEVIATION_THRESHOLDS.LOW) {
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

    // Calculate confidence score
    const nutritionAccuracy = Math.max(0, 100 - avgDeviation);
    const nameMatchScore = similarityScore * 100;

    const confidenceScore = Math.round(
        CONFIG.CONFIDENCE_WEIGHTS.nameMatch * nameMatchScore +
        CONFIG.CONFIDENCE_WEIGHTS.nutritionAccuracy * nutritionAccuracy
    );

    // Determine if we should auto-correct
    const shouldCorrect = avgDeviation > CONFIG.AUTO_CORRECT_THRESHOLD;

    let correctedEstimate: NutritionEstimate | undefined;
    if (shouldCorrect) {
        correctedEstimate = { ...groundTruthData };
        logger.info('Auto-correcting LLM estimate with ground truth', {
            originalCalories: llmEstimate.calories,
            correctedCalories: groundTruthData.calories,
            avgDeviation: Math.round(avgDeviation),
        });
    }

    const hasCriticalDeviation = deviations.some(d => d.severity === 'critical');

    const result: ValidationResult = {
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

    // Log validation result
    logger.info('Ground truth validation complete', {
        foodName: llmEstimate.name,
        matchedFood: groundTruth.name,
        confidenceScore,
        source: result.source,
        deviationCount: deviations.length,
        avgDeviation: Math.round(avgDeviation),
    });

    return result;
}

/**
 * Validate multiple food items in batch
 */
export async function validateBatch(
    estimates: NutritionEstimate[]
): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const estimate of estimates) {
        const result = await validateNutritionEstimate(estimate);
        results.push(result);
    }

    return results;
}

/**
 * Get the best nutrition data - from ground truth if available, otherwise validated LLM
 */
export async function getBestNutritionData(
    foodName: string,
    llmEstimate?: NutritionEstimate
): Promise<{ data: NutritionEstimate; source: string; confidence: number }> {
    // First try to get from ground truth directly
    const matchResult = await findBestMatch(foodName);

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

    // If we have an LLM estimate, validate and potentially correct it
    if (llmEstimate) {
        const validation = await validateNutritionEstimate(llmEstimate);

        return {
            data: validation.correctedEstimate || validation.originalEstimate,
            source: validation.source,
            confidence: validation.confidenceScore,
        };
    }

    // No data available
    throw new Error(`No nutrition data found for: ${foodName}`);
}

/**
 * Get accuracy metrics for monitoring
 */
export async function getAccuracyMetrics(
    timeRangeHours: number = 24
): Promise<AccuracyMetrics> {
    // This would typically read from a metrics database/cache
    // For now, return placeholder metrics
    return {
        totalValidations: 0,
        matchedCount: 0,
        averageConfidenceScore: 0,
        averageDeviation: {
            calories: 0,
            proteinG: 0,
            carbsG: 0,
            fatG: 0,
        },
        highAccuracyCount: 0,
        lowAccuracyCount: 0,
    };
}

/**
 * Log validation metrics for analysis
 */
export async function logValidationMetric(
    validation: ValidationResult
): Promise<void> {
    // Log validation metrics for analysis and monitoring
    // This uses the logger for now - can be extended to use external analytics
    try {
        logger.info('Ground truth validation metric', {
            type: 'ground_truth_validation',
            foodName: validation.originalEstimate.name,
            matchedFood: validation.matchedFoodName,
            confidenceScore: validation.confidenceScore,
            source: validation.source,
            isValid: validation.isValid,
            deviationCount: validation.deviations.length,
            similarityScore: validation.similarityScore,
            timestamp: new Date().toISOString(),
        });

        // Log critical deviations separately for monitoring
        const criticalDeviations = validation.deviations.filter(d => d.severity === 'critical');
        if (criticalDeviations.length > 0) {
            logger.warn('Critical nutrition deviation detected', {
                type: 'ground_truth_critical',
                foodName: validation.originalEstimate.name,
                criticalDeviations,
            });
        }
    } catch (error) {
        // Silently fail - metrics logging should not break main flow
        logger.debug('Failed to log validation metric', { error });
    }
}

// ============================================
// Exports
// ============================================

export default {
    validateNutritionEstimate,
    validateBatch,
    findBestMatch,
    getBestNutritionData,
    getAccuracyMetrics,
    logValidationMetric,
    CONFIG,
};
