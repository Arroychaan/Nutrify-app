import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../src/config/logger.js';

const prisma = new PrismaClient();

interface NutritionCSVRow {
  id: string;
  calories: string;
  proteins: string;
  fat: string;
  carbohydrate: string;
  name: string;
  image: string;
}

/**
 * Parse CSV file and return array of objects
 */
function parseCSV(csvContent: string): NutritionCSVRow[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  const rows: NutritionCSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle CSV fields that might contain commas in URLs
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // If simple parsing works (no quoted fields)
    if (values.length < 7) {
      const simpleValues = line.split(',');
      // Handle case where URL might have commas - join the rest
      if (simpleValues.length >= 7) {
        values.length = 0;
        values.push(
          simpleValues[0], // id
          simpleValues[1], // calories
          simpleValues[2], // proteins
          simpleValues[3], // fat
          simpleValues[4], // carbohydrate
          simpleValues[5], // name
          simpleValues.slice(6).join(',') // image (might have commas)
        );
      }
    }
    
    if (values.length >= 7) {
      rows.push({
        id: values[0],
        calories: values[1],
        proteins: values[2],
        fat: values[3],
        carbohydrate: values[4],
        name: values[5],
        image: values[6],
      });
    }
  }
  
  return rows;
}

/**
 * Categorize food based on its name
 */
function categorizeFood(name: string): string {
  const nameLower = name.toLowerCase();
  
  // Proteins
  if (
    nameLower.includes('ikan') ||
    nameLower.includes('ayam') ||
    nameLower.includes('daging') ||
    nameLower.includes('sapi') ||
    nameLower.includes('kambing') ||
    nameLower.includes('bebek') ||
    nameLower.includes('telur') ||
    nameLower.includes('udang') ||
    nameLower.includes('cumi') ||
    nameLower.includes('kepiting') ||
    nameLower.includes('kerang') ||
    nameLower.includes('tempe') ||
    nameLower.includes('tahu') ||
    nameLower.includes('abon') ||
    nameLower.includes('dendeng') ||
    nameLower.includes('bakso') ||
    nameLower.includes('sosis') ||
    nameLower.includes('kornet')
  ) {
    return 'proteins';
  }
  
  // Grains & Carbs
  if (
    nameLower.includes('nasi') ||
    nameLower.includes('beras') ||
    nameLower.includes('mie') ||
    nameLower.includes('roti') ||
    nameLower.includes('bubur') ||
    nameLower.includes('ketupat') ||
    nameLower.includes('lontong') ||
    nameLower.includes('singkong') ||
    nameLower.includes('ubi') ||
    nameLower.includes('kentang') ||
    nameLower.includes('jagung') ||
    nameLower.includes('tepung') ||
    nameLower.includes('biskuit') ||
    nameLower.includes('kue') ||
    nameLower.includes('gorengan')
  ) {
    return 'grains';
  }
  
  // Vegetables
  if (
    nameLower.includes('bayam') ||
    nameLower.includes('kangkung') ||
    nameLower.includes('sawi') ||
    nameLower.includes('wortel') ||
    nameLower.includes('brokoli') ||
    nameLower.includes('kubis') ||
    nameLower.includes('kol') ||
    nameLower.includes('terong') ||
    nameLower.includes('labu') ||
    nameLower.includes('timun') ||
    nameLower.includes('tomat') ||
    nameLower.includes('sayur') ||
    nameLower.includes('daun') ||
    nameLower.includes('selada') ||
    nameLower.includes('kacang panjang') ||
    nameLower.includes('buncis') ||
    nameLower.includes('pare') ||
    nameLower.includes('tauge')
  ) {
    return 'vegetables';
  }
  
  // Fruits
  if (
    nameLower.includes('apel') ||
    nameLower.includes('jeruk') ||
    nameLower.includes('pisang') ||
    nameLower.includes('mangga') ||
    nameLower.includes('pepaya') ||
    nameLower.includes('semangka') ||
    nameLower.includes('melon') ||
    nameLower.includes('anggur') ||
    nameLower.includes('nanas') ||
    nameLower.includes('alpukat') ||
    nameLower.includes('durian') ||
    nameLower.includes('rambutan') ||
    nameLower.includes('manggis') ||
    nameLower.includes('jambu') ||
    nameLower.includes('buah') ||
    nameLower.includes('salak') ||
    nameLower.includes('duku') ||
    nameLower.includes('kelapa')
  ) {
    return 'fruits';
  }
  
  // Dairy
  if (
    nameLower.includes('susu') ||
    nameLower.includes('keju') ||
    nameLower.includes('yogurt') ||
    nameLower.includes('mentega') ||
    nameLower.includes('krim')
  ) {
    return 'dairy';
  }
  
  // Spices & Herbs
  if (
    nameLower.includes('jahe') ||
    nameLower.includes('kunyit') ||
    nameLower.includes('lengkuas') ||
    nameLower.includes('serai') ||
    nameLower.includes('bawang') ||
    nameLower.includes('cabai') ||
    nameLower.includes('cabe') ||
    nameLower.includes('lada') ||
    nameLower.includes('merica') ||
    nameLower.includes('ketumbar') ||
    nameLower.includes('kemiri') ||
    nameLower.includes('pala') ||
    nameLower.includes('cengkeh') ||
    nameLower.includes('kayu manis') ||
    nameLower.includes('bumbu')
  ) {
    return 'spices';
  }
  
  // Oils
  if (
    nameLower.includes('minyak') ||
    nameLower.includes('santan')
  ) {
    return 'oils';
  }
  
  // Beverages
  if (
    nameLower.includes('teh') ||
    nameLower.includes('kopi') ||
    nameLower.includes('jus') ||
    nameLower.includes('sirup') ||
    nameLower.includes('minuman') ||
    nameLower.includes('es ')
  ) {
    return 'beverages';
  }
  
  // Snacks
  if (
    nameLower.includes('kerupuk') ||
    nameLower.includes('keripik') ||
    nameLower.includes('emping') ||
    nameLower.includes('rempeyek') ||
    nameLower.includes('krupuk')
  ) {
    return 'snacks';
  }
  
  // Complete dishes (Indonesian food)
  if (
    nameLower.includes('rendang') ||
    nameLower.includes('soto') ||
    nameLower.includes('gado') ||
    nameLower.includes('sate') ||
    nameLower.includes('pecel') ||
    nameLower.includes('rawon') ||
    nameLower.includes('gulai') ||
    nameLower.includes('opor') ||
    nameLower.includes('lodeh') ||
    nameLower.includes('sambal') ||
    nameLower.includes('goreng') ||
    nameLower.includes('bakar') ||
    nameLower.includes('rebus') ||
    nameLower.includes('tumis') ||
    nameLower.includes('capcay') ||
    nameLower.includes('cap cay')
  ) {
    return 'prepared_dishes';
  }
  
  // Default
  return 'other';
}

/**
 * Determine if food is vegetarian
 */
function isVegetarian(name: string): boolean {
  const nameLower = name.toLowerCase();
  const meatKeywords = [
    'ikan', 'ayam', 'daging', 'sapi', 'kambing', 'bebek', 'babi',
    'udang', 'cumi', 'kepiting', 'kerang', 'telur', 'abon', 'dendeng',
    'bakso', 'sosis', 'kornet', 'hati', 'otak', 'jeroan', 'kikil',
    'angsa', 'burung', 'kelinci', 'rusa', 'kerbau', 'domba'
  ];
  
  return !meatKeywords.some(keyword => nameLower.includes(keyword));
}

/**
 * Determine if food is vegan
 */
function isVegan(name: string): boolean {
  const nameLower = name.toLowerCase();
  const animalKeywords = [
    'ikan', 'ayam', 'daging', 'sapi', 'kambing', 'bebek', 'babi',
    'udang', 'cumi', 'kepiting', 'kerang', 'telur', 'abon', 'dendeng',
    'bakso', 'sosis', 'kornet', 'hati', 'otak', 'jeroan', 'kikil',
    'susu', 'keju', 'mentega', 'krim', 'yogurt', 'madu',
    'angsa', 'burung', 'kelinci', 'rusa', 'kerbau', 'domba'
  ];
  
  return !animalKeywords.some(keyword => nameLower.includes(keyword));
}

/**
 * Determine if food is halal
 */
function isHalal(name: string): boolean {
  const nameLower = name.toLowerCase();
  const haramKeywords = ['babi', 'pork', 'ham', 'bacon', 'lard'];
  
  return !haramKeywords.some(keyword => nameLower.includes(keyword));
}

/**
 * Estimate sodium based on food type
 */
function estimateSodium(name: string, category: string): number {
  const nameLower = name.toLowerCase();
  
  // High sodium foods
  if (
    nameLower.includes('abon') ||
    nameLower.includes('dendeng') ||
    nameLower.includes('asin') ||
    nameLower.includes('teri') ||
    nameLower.includes('kecap') ||
    nameLower.includes('sambal') ||
    nameLower.includes('kerupuk') ||
    nameLower.includes('keripik') ||
    nameLower.includes('mie instan') ||
    nameLower.includes('sosis') ||
    nameLower.includes('kornet') ||
    nameLower.includes('bakso')
  ) {
    return 800; // High sodium estimate
  }
  
  // Medium sodium (processed/prepared foods)
  if (
    category === 'prepared_dishes' ||
    nameLower.includes('goreng') ||
    nameLower.includes('tumis') ||
    nameLower.includes('bakar')
  ) {
    return 400;
  }
  
  // Fresh foods - low sodium
  if (category === 'vegetables' || category === 'fruits') {
    return 5;
  }
  
  // Default medium-low
  return 50;
}

/**
 * Estimate fiber based on food type
 */
function estimateFiber(name: string, category: string, carbs: number): number {
  const nameLower = name.toLowerCase();
  
  // High fiber foods
  if (
    nameLower.includes('sayur') ||
    nameLower.includes('bayam') ||
    nameLower.includes('kangkung') ||
    nameLower.includes('brokoli') ||
    nameLower.includes('kacang') ||
    nameLower.includes('ubi') ||
    nameLower.includes('singkong') ||
    category === 'vegetables'
  ) {
    return Math.min(carbs * 0.15, 8); // ~15% of carbs, max 8g
  }
  
  // Medium fiber
  if (category === 'fruits' || category === 'grains') {
    return Math.min(carbs * 0.08, 4);
  }
  
  // Low fiber (proteins, processed foods)
  return 0.5;
}

/**
 * Estimate sugar based on food type
 */
function estimateSugar(name: string, category: string, carbs: number): number {
  const nameLower = name.toLowerCase();
  
  // High sugar foods
  if (
    nameLower.includes('manis') ||
    nameLower.includes('gula') ||
    nameLower.includes('sirup') ||
    nameLower.includes('kue') ||
    nameLower.includes('permen') ||
    nameLower.includes('cokelat') ||
    nameLower.includes('es krim')
  ) {
    return Math.min(carbs * 0.6, 30);
  }
  
  // Fruits - natural sugars
  if (category === 'fruits') {
    return Math.min(carbs * 0.5, 15);
  }
  
  // Beverages
  if (category === 'beverages') {
    return Math.min(carbs * 0.7, 20);
  }
  
  // Low sugar
  if (category === 'proteins' || category === 'vegetables' || category === 'spices') {
    return Math.min(carbs * 0.05, 2);
  }
  
  // Default
  return Math.min(carbs * 0.1, 5);
}

/**
 * Get health benefits based on food type
 */
function getBenefits(name: string, category: string, nutrition: { protein: number; carbs: number; fat: number; calories: number }): string[] {
  const benefits: string[] = [];
  const nameLower = name.toLowerCase();
  
  // High protein
  if (nutrition.protein > 15) {
    benefits.push('Tinggi protein untuk pembentukan otot');
  }
  
  // Low calorie
  if (nutrition.calories < 100 && category !== 'spices') {
    benefits.push('Rendah kalori, cocok untuk diet');
  }
  
  // Vegetables
  if (category === 'vegetables') {
    benefits.push('Kaya serat untuk pencernaan');
    benefits.push('Sumber vitamin dan mineral');
  }
  
  // Fruits
  if (category === 'fruits') {
    benefits.push('Sumber vitamin alami');
    benefits.push('Antioksidan tinggi');
  }
  
  // Spices
  if (category === 'spices') {
    if (nameLower.includes('kunyit')) {
      benefits.push('Anti-inflamasi alami');
    }
    if (nameLower.includes('jahe')) {
      benefits.push('Membantu pencernaan');
    }
  }
  
  // Tempe/Tahu
  if (nameLower.includes('tempe') || nameLower.includes('tahu')) {
    benefits.push('Protein nabati berkualitas tinggi');
    benefits.push('Cocok untuk vegetarian');
  }
  
  return benefits.length > 0 ? benefits : ['Sumber nutrisi untuk energi harian'];
}

/**
 * Main seeding function for nutrition CSV
 */
async function seedNutritionCSV() {
  logger.info('Starting nutrition CSV seeding...');
  
  // Read CSV file
  const csvPath = path.join(__dirname, '../../nutrition.csv');
  
  if (!fs.existsSync(csvPath)) {
    logger.error(`CSV file not found at: ${csvPath}`);
    throw new Error('nutrition.csv not found');
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);
  
  logger.info(`Parsed ${rows.length} foods from CSV`);
  
  let created = 0;
  let updated = 0;
  let errors = 0;
  
  for (const row of rows) {
    try {
      const calories = parseFloat(row.calories) || 0;
      const protein = parseFloat(row.proteins) || 0;
      const fat = parseFloat(row.fat) || 0;
      const carbs = parseFloat(row.carbohydrate) || 0;
      const category = categorizeFood(row.name);
      
      const foodData = {
        name: row.name,
        commonNames: [],
        category: category,
        origin: 'Indonesia',
        calories: calories,
        proteinG: protein,
        carbsG: carbs,
        fiberG: estimateFiber(row.name, category, carbs),
        fatG: fat,
        saturatedFatG: fat * 0.35, // Estimate 35% of fat is saturated
        sodiumMg: estimateSodium(row.name, category),
        sugarG: estimateSugar(row.name, category, carbs),
        cholesterolMg: category === 'proteins' && !isVegan(row.name) ? 50 : 0,
        isVegetarian: isVegetarian(row.name),
        isVegan: isVegan(row.name),
        isHalal: isHalal(row.name),
        benefits: getBenefits(row.name, category, { protein, carbs, fat, calories }),
        commonPreparations: [],
        cookingTips: null,
        culturalSignificance: {
          culture: 'Indonesia',
          usages: ['Everyday'],
        },
      };
      
      // Check if food already exists
      const existing = await prisma.localFood.findFirst({
        where: { name: row.name },
      });
      
      if (existing) {
        // Update existing food
        await prisma.localFood.update({
          where: { id: existing.id },
          data: foodData as any,
        });
        updated++;
      } else {
        // Create new food
        await prisma.localFood.create({
          data: foodData as any,
        });
        created++;
      }
      
      // Log progress every 100 foods
      if ((created + updated) % 100 === 0) {
        logger.info(`Progress: ${created + updated}/${rows.length} foods processed`);
      }
    } catch (error) {
      logger.error(`Error processing food: ${row.name}`, error);
      errors++;
    }
  }
  
  logger.info(`Seeding complete!`);
  logger.info(`Created: ${created} foods`);
  logger.info(`Updated: ${updated} foods`);
  logger.info(`Errors: ${errors}`);
  
  return { created, updated, errors };
}

async function main() {
  try {
    logger.info('='.repeat(60));
    logger.info('NUTRITION DATABASE SEEDING');
    logger.info('='.repeat(60));
    
    const result = await seedNutritionCSV();
    
    logger.info('='.repeat(60));
    logger.info('SEEDING COMPLETED SUCCESSFULLY');
    logger.info(`Total foods in database: ${result.created + result.updated}`);
    logger.info('='.repeat(60));
  } catch (error) {
    logger.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
