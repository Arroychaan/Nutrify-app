
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
 * Compliance Validation Result
 */
export interface ComplianceResult {
    score: number; // 0-100
    status: 'compliant' | 'non_compliant' | 'warning';
    details: string;
    recommendations: string[];
    sourceDocument: string;
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

        // Since AKG PDF is large, we might want to truncate or focus it
        // But Gemini 1.5 Flash handles large context well. 
        // We will extract a reasonable chunk if needed, but for now passing the first 50k chars 
        // or the whole thing if the model supports it. 
        // Let's rely on the LLM service to handle the context window, assuming Gemini 1.5 Flash.
        // If it's too big, we might need to implement "Smart Retrieval" later.
        // For "Quick Win", let's assume we can pass a significant chunk.
        // Permenkes 28/2019 is about 50 pages. Text only is likely < 100k tokens.

        // 2. Construct Prompt
        const systemPrompt = `You are a Compliance Officer for a Nutrition App.
Your job is to validate a user's Meal Plan against the Official Indonesian Nutrition Guidelines (Permenkes No 28 Tahun 2019).

You have access to the full text of the regulation below.
You must use ONLY the provided regulation text to determining the "Angka Kecukupan Gizi" (AKG) for the user.

Output format must be JSON:
{
  "score": number, // 0-100
  "status": "compliant" | "warning" | "non_compliant",
  "details": "Explanation citing specific tables or pages from the regulation",
  "recommendations": ["rec1", "rec2"]
}`;

        const userDescription = `
User Profile:
- Gender: ${userProfile.gender}
- Age: ${userProfile.age} years
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
${akgText.slice(0, 500000)} 
=== END DOCUMENT ===

INSTRUCTIONS:
1. Identify the correct Age Group and Gender row in the tables within the document.
2. Determine the Standard AKG values (Energy, Protein, Fat, Carbs) for this user.
3. Compare the Proposed Meal Plan with the Standard AKG.
   - Tolerance: +/- 10% is excellent (Score 90-100)
   - Tolerance: +/- 20% is good (Score 80-89)
   - Tolerance: > 20% deviation reduces score.
4. If the user has conditions (e.g. Obesity), checking if the plan has a deficit is good (Compliance with medical needs overrides strict AKG maintenance).
5. Generate the JSON report.
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
            sourceDocument: 'system_fallback'
        };
    }
}

export default {
    validateWithKnowledge
};
