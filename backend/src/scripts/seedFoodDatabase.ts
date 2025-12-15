
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CSV_FILE_PATH = path.resolve(process.cwd(), 'data/knowledge_base/nutrition.csv');

interface FoodRow {
    name: string;
    calories: string;
    proteins: string;
    fat: string;
    carbohydrate: string;
    image: string;
    // id removed as we auto-generate it or don't use it
}

const mapCategory = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('ayam') || lower.includes('daging') || lower.includes('ikan') || lower.includes('bebek') || lower.includes('sapi')) return 'proteins';
    if (lower.includes('sayur') || lower.includes('bayam') || lower.includes('kangkung')) return 'vegetables';
    if (lower.includes('buah') || lower.includes('pisang') || lower.includes('apel') || lower.includes('jeruk')) return 'fruits';
    if (lower.includes('nasi') || lower.includes('mie') || lower.includes('roti')) return 'grains';
    if (lower.includes('susu') || lower.includes('keju') || lower.includes('yogurt')) return 'dairy';
    return 'prepared_dishes';
};

async function seed() {
    console.log('🌱 Seeding food database from CSV...');

    if (!fs.existsSync(CSV_FILE_PATH)) {
        console.error(`❌ CSV file not found at: ${CSV_FILE_PATH}`);
        process.exit(1);
    }

    const foods: any[] = [];

    fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row: FoodRow) => {
            // Basic validation
            if (!row.name) return;

            const calories = parseFloat(row.calories) || 0;
            const protein = parseFloat(row.proteins) || 0;
            const fat = parseFloat(row.fat) || 0;
            const carbs = parseFloat(row.carbohydrate) || 0;

            // Skip invalid entries (like Headers if csv-parser fails, or corruption)
            if (calories === 0 && protein === 0 && fat === 0 && carbs === 0 && row.name.toLowerCase() !== 'air') return;

            foods.push({
                name: row.name,
                category: mapCategory(row.name),
                calories,
                proteinG: protein,
                fatG: fat,
                carbsG: carbs,
                // Default values for missing cols
                fiberG: 0,
                sodiumMg: 0,
                sugarG: 0,
                // Prisma schema specific fields
                commonNames: [],
                seasonsAvailable: [],
                commonAllergies: [],
                benefits: [],
                commonPreparations: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
        })
        .on('end', async () => {
            console.log(`Parsed ${foods.length} foods from CSV.`);

            let successCount = 0;
            let errorCount = 0;

            for (const food of foods) {
                try {
                    // Check for existing to avoid duplicates
                    const existing = await prisma.localFood.findFirst({
                        where: { name: { equals: food.name, mode: 'insensitive' } }
                    });

                    if (!existing) {
                        await prisma.localFood.create({
                            data: food
                        });
                        successCount++;
                    } else {
                        process.stdout.write('.'); // Skip indicator
                    }
                } catch (e) {
                    console.error(`Failed to add ${food.name}:`, e);
                    errorCount++;
                }
            }

            console.log(`\n✅ Seeding complete! Added: ${successCount}, Skipped/Failed: ${errorCount}`);
            await prisma.$disconnect();
        });
}

seed().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
