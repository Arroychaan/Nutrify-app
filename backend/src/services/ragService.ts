
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import config from '@config/index.js';
import logger from '@config/logger.js';
import { geminiGenerateWithRotation } from './llmService.js';

// Cache for document content
let documentCache: Record<string, string> = {};

const KNOWLEDGE_BASE_DIR = path.resolve(process.cwd(), 'data/knowledge_base');
const AKG_FILENAME = 'Permenkes Nomor 28 Tahun 2019.pdf';

/**
 * Compliance Validation Result metrics
 */
export interface ComplianceMetric {
    nutrient: string;
    aiValue: number;
    referenceValue: number;
    deviation: number;
    score: number;
    status: string;
    source?: string;
}

/**
 * Compliance Validation Result
 */
export interface ComplianceResult {
    score: number; // 0-100
    status: 'compliant' | 'non_compliant' | 'warning';
    details: string;
    recommendations: string[];
    sourceDocument: string;
    metrics: ComplianceMetric[];
}

/**
 * Load and parse PDF text
 */
async function loadPdfContent(filename: string): Promise<string> {
    if (documentCache[filename]) {
        return documentCache[filename];
    }

    const filePath = path.join(KNOWLEDGE_BASE_DIR, filename);

    try {
        if (!fs.existsSync(filePath)) {
            logger.error(`Document not found: ${filePath}`);
            return '';
        }

        const dataBuffer = fs.readFileSync(filePath);
        logger.info('PDF Parse Library Type:', typeof pdf);
        const data = await (pdf as any)(dataBuffer);

        // Cache the text content
        // We clean it up a bit to reduce token usage
        const cleanText = data.text.replace(/\n\s*\n/g, '\n').trim();
        documentCache[filename] = cleanText;

        logger.info(`Loaded PDF document: ${filename} (${cleanText.length} chars)`);
        return cleanText;
    } catch (error) {
        logger.error(`Error reading PDF ${filename}:`, error);
        throw error;
    }
}

/**
 * Validate Meal Plan Compliance using RAG (Retrieval Augmented Generation)
 * This uses the Permenkes 2019 PDF as the "Golden Source" of truth.
 */
export async function validateWithKnowledge(
    userProfile: any,
    mealPlanSummary: any
): Promise<ComplianceResult> {
    try {
        // 1. Retrieve Knowledge
        const akgText = await loadPdfContent(AKG_FILENAME);

        if (!akgText) {
            throw new Error('Failed to load validation documents');
        }

        // 2. Construct Prompt
        const systemPrompt = `You are a Compliance Officer for a Nutrition App.
Your job is to validate a user's Meal Plan against the Official Indonesian Nutrition Guidelines (Permenkes No 28 Tahun 2019).

You have access to the full regulation text.
You must use ONLY the provided regulation to determine the "Angka Kecukupan Gizi" (AKG).

Output format must be strictly JSON:
{
  "score": number, // Overall 0-100
  "status": "compliant" | "warning" | "non_compliant",
  "details": "Summary of findings",
  "recommendations": ["rec1", "rec2"],
  "metrics": [
    {
      "nutrient": "Energy",
      "aiValue": number, // from input
      "referenceValue": number, // from Permenkes string number
      "deviation": number, // abs(ai - ref) / ref
      "score": number, // 0-100 for this metric
      "status": "SESUAI" | "CUKUP SESUAI" | "TIDAK SESUAI",
      "source": "Permenkes RI No. 28 Tahun 2019, Page X Table Y"
    },
    {
      "nutrient": "Protein", 
      // ... same structure
    },
    // Include Fat and Carbs too
  ]
}`;

        const userDescription = `
User Profile:
- Gender: ${userProfile.gender}
- Age: ${userProfile.age}
- Weight: ${userProfile.currentWeightKg} kg
- Height: ${userProfile.heightCm} cm
- Condition: ${userProfile.medicalConditions?.join(', ') || 'Healthy'}
- Activity: ${userProfile.activityLevel}
`;

        const planDescription = `
Proposed Meal Plan Daily Average:
- Calories: ${mealPlanSummary.totalCalories} kcal
- Protein: ${mealPlanSummary.totalProtein} g
- Carbs: ${mealPlanSummary.totalCarbs} g
- Fat: ${mealPlanSummary.totalFat} g
`;

        const prompt = `
${userDescription}

${planDescription}

=== REFERENCE DOCUMENT (PERMENKES NO 28 TAHUN 2019) ===
${akgText.slice(0, 300000)}

=== EXTRACTED DATA SUMMARY (LAMPIRAN I - TABEL AKG) ===
Use this table if the raw document text is difficult to parse.
Values per Day:
Kelompok Umur (Age) | Energi (kcal) | Protein (g) | Lemak (g) | Karbohidrat (g)
--- MALE (Laki-laki) ---
10-12 tahun | 2000 | 50 | 65 | 300
13-15 tahun | 2400 | 70 | 80 | 350
16-18 tahun | 2650 | 75 | 85 | 400
19-29 tahun | 2650 | 65 | 75 | 430
30-49 tahun | 2550 | 60 | 70 | 415
50-64 tahun | 2150 | 60 | 60 | 340
65-80 tahun | 1800 | 58 | 50 | 275
80+ tahun   | 1600 | 58 | 45 | 235

--- FEMALE (Perempuan) ---
10-12 tahun | 1900 | 55 | 65 | 280
13-15 tahun | 2050 | 65 | 70 | 300
16-18 tahun | 2100 | 65 | 75 | 300
19-29 tahun | 2250 | 60 | 65 | 360
30-49 tahun | 2150 | 60 | 60 | 340
50-64 tahun | 1800 | 60 | 50 | 280
65-80 tahun | 1550 | 58 | 45 | 230
80+ tahun   | 1400 | 58 | 40 | 200

IMPORTANT: 
- Choose the row based on the user's Age and Gender.
- Use these exact values as the "Reference (AKG)".
- Fat (Lemak) and Carbs (Karbohidrat) ARE provided in this table. Do not say they are missing.
=== END DOCUMENT ===

INSTRUCTIONS:
1. Identify the AKG Age Group row for this user.
2. Determine Standard AKG for Energy, Protein, Fat, Carbs.
3. Compare Proposed Plan vs Standard.
4. Calculate Deviation and Scores.
   - Deviation = abs(Proposed - Standard) / Standard
   - Score = 100 - (Deviation * 100). If Deviation > 0.5, score can be lower.
5. Generate the JSON report with "metrics" array.
`;

        // 3. Generate Evaluation
        const responseText = await geminiGenerateWithRotation(prompt, systemPrompt);

        // 4. Parse
        const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(cleanText);

        return {
            ...result,
            sourceDocument: AKG_FILENAME
        };

    } catch (error) {
        logger.error('RAG Validation failed:', error);
        // Fallback if RAG fails
        return {
            score: 50,
            status: 'warning',
            details: 'Validation service unavailable: ' + (error instanceof Error ? error.message : String(error)),
            recommendations: ['Check again later'],
            sourceDocument: 'system_fallback',
            metrics: []
        };
    }
}

export default {
    validateWithKnowledge
};
