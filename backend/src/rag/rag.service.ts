import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { LlmService } from '../llm/llm.service.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

import * as pdf from 'pdf-parse';

export interface ComplianceMetric {
  nutrient: string;
  aiValue: number;
  referenceValue: number;
  deviation: number;
  score: number;
  status: string;
  source?: string;
}

export interface ComplianceResult {
  score: number;
  status: 'compliant' | 'non_compliant' | 'warning';
  details: string;
  recommendations: string[];
  sourceDocument: string;
  metrics: ComplianceMetric[];
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly documentCache: Record<string, string> = {};
  private readonly knowledgeBaseDir = path.resolve(
    process.cwd(),
    'data/knowledge_base',
  );
  private readonly akgFilename = 'Permenkes Nomor 28 Tahun 2019.pdf';

  constructor(private llmService: LlmService) {}

  private async loadPdfContent(filename: string): Promise<string> {
    if (this.documentCache[filename]) {
      return this.documentCache[filename];
    }

    const filePath = path.join(this.knowledgeBaseDir, filename);

    try {
      if (!fs.existsSync(filePath)) {
        this.logger.error(`Document not found: ${filePath}`);
        return '';
      }

      const dataBuffer = fs.readFileSync(filePath);
      const data = await (pdf as any)(dataBuffer);

      // Clean up text content to optimize token usage
      const cleanText = data.text.replace(/\n\s*\n/g, '\n').trim();
      this.documentCache[filename] = cleanText;

      this.logger.log(
        `Loaded PDF document: ${filename} (${cleanText.length} chars)`,
      );
      return cleanText;
    } catch (error) {
      this.logger.error(`Error reading PDF ${filename}:`, error);
      throw error;
    }
  }

  async validateWithKnowledge(
    userProfile: any,
    mealPlanSummary: any,
  ): Promise<ComplianceResult> {
    try {
      const akgText = await this.loadPdfContent(this.akgFilename);

      if (!akgText) {
        throw new Error('Failed to load validation documents');
      }

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
    }
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
   - Score = 100 - (Deviation * 100).
5. Generate the JSON report with "metrics" array.
`;

      const responseText = await this.llmService.generateWithRotation(
        prompt,
        systemPrompt,
      );

      const cleanText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const result = JSON.parse(cleanText);

      // Programmatic mathematical verification (recalculating since LLMs can do errors in math)
      if (result.metrics && Array.isArray(result.metrics)) {
        result.metrics = result.metrics.map((m: any) => {
          const aiVal = Number(m.aiValue) || 0;
          const refVal = Number(m.referenceValue) || 1; // avoid division by zero

          const deviation = Math.abs(aiVal - refVal) / refVal;

          let score = Math.max(0, 100 - deviation * 100);
          score = Math.round(score);

          let status = 'SESUAI';
          if (deviation > 0.2) status = 'TIDAK SESUAI';
          else if (deviation > 0.1) status = 'CUKUP SESUAI';

          return {
            ...m,
            deviation: Number(deviation.toFixed(4)),
            score: score,
            status: status,
          };
        });

        const totalScore = result.metrics.reduce(
          (acc: number, curr: any) => acc + curr.score,
          0,
        );
        result.score =
          result.metrics.length > 0
            ? Math.round(totalScore / result.metrics.length)
            : 0;

        if (result.score >= 80) result.status = 'compliant';
        else if (result.score >= 60) result.status = 'warning';
        else result.status = 'non_compliant';
      }

      return {
        ...result,
        sourceDocument: this.akgFilename,
      };
    } catch (error) {
      this.logger.error('RAG Validation failed:', error);
      return {
        score: 50,
        status: 'warning',
        details:
          'Validation service unavailable: ' +
          (error instanceof Error ? error.message : String(error)),
        recommendations: ['Check again later'],
        sourceDocument: 'system_fallback',
        metrics: [],
      };
    }
  }
}
