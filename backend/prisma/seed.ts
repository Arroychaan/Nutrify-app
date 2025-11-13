import { PrismaClient } from '@prisma/client';
import logger from '../src/config/logger.js';

const prisma = new PrismaClient();

/**
 * Comprehensive database seeding with Indonesian local foods
 * Includes nutrition data, cultural significance, and medical properties
 */
async function seedLocalFoods() {
  logger.info('Seeding local foods database...');

  const localFoods = [
    // PROTEINS - Jawa/Sunda
    {
      name: 'Ikan Teri (Teri)',
      commonNames: ['Ikan bilis', 'Small dried anchovies'],
      category: 'proteins',
      origin: 'Jawa',
      calories: 205,
      proteinG: 20,
      carbsG: 0,
      fiberG: 0,
      fatG: 13,
      saturatedFatG: 3.3,
      sodiumMg: 800,
      sugarG: 0,
      calcium: 350,
      iron: 2.5,
      potassium: 180,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      commonAllergies: ['shellfish'],
      contraindications: [
        {
          condition: 'Hipertensi',
          reason: 'Tinggi sodium dari penggaraman',
          severity: 'caution',
        },
      ],
      benefits: ['Kaya kalsium untuk tulang', 'Sumber protein tinggi'],
      commonPreparations: ['Tumis', 'Goreng', 'Sambal'],
      cookingTips:
        'Gunakan sedikit garam karena sudah asin, sempurna untuk bumbu sambal',
      culturalSignificance: [
        {
          culture: 'Jawa',
          usages: ['Everyday', 'Celebration'],
        },
      ],
    },

    // PROTEINS - Bugis/Sulawesi
    {
      name: 'Ikan Tenggiri',
      commonNames: ['Mackerel Spanish', 'Kingfish'],
      category: 'proteins',
      origin: 'Bugis',
      calories: 189,
      proteinG: 20,
      carbsG: 0,
      fiberG: 0,
      fatG: 11,
      saturatedFatG: 3,
      sodiumMg: 70,
      sugarG: 0,
      omega3: 1.5,
      vitaminD: 14,
      calcium: 50,
      iron: 0.5,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      commonAllergies: ['fish'],
      benefits: [
        'Omega-3 untuk jantung',
        'Vitamin D tinggi',
        'Menurunkan kolesterol',
      ],
      commonPreparations: ['Pepes', 'Goreng', 'Kuah kuning'],
      cookingTips: 'Sempurna untuk pepes dengan daun pisang',
      culturalSignificance: [
        {
          culture: 'Bugis',
          usages: ['Everyday', 'Celebration'],
        },
      ],
    },

    // PROTEINS - Vegetarian
    {
      name: 'Tempe',
      commonNames: ['Tempeh', 'Fermented soybean'],
      category: 'proteins',
      origin: 'Jawa',
      calories: 195,
      proteinG: 19,
      carbsG: 7,
      fiberG: 1,
      fatG: 11,
      saturatedFatG: 2,
      sodiumMg: 5,
      sugarG: 0,
      calcium: 111,
      iron: 2.7,
      magnesium: 65,
      isVegetarian: true,
      isVegan: true,
      isHalal: true,
      commonAllergies: ['soy'],
      benefits: [
        'Protein lengkap untuk vegetarian',
        'Probiotik untuk pencernaan',
        'Rendah sodium',
      ],
      commonPreparations: ['Goreng', 'Bacem', 'Pecel'],
      cookingTips: 'Bisa goreng atau rebus, fleksibel dengan berbagai bumbu',
      culturalSignificance: [
        {
          culture: 'Jawa',
          usages: ['Everyday'],
        },
      ],
    },

    // PROTEINS - Dairy
    {
      name: 'Telur Ayam',
      commonNames: ['Chicken egg', 'Telur'],
      category: 'proteins',
      origin: 'All',
      calories: 155,
      proteinG: 13,
      carbsG: 1,
      fiberG: 0,
      fatG: 11,
      saturatedFatG: 3,
      sodiumMg: 124,
      sugarG: 1,
      cholesterolMg: 372,
      calcium: 56,
      iron: 1.8,
      vitaminD: 7,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      commonAllergies: ['eggs'],
      benefits: ['Protein lengkap', 'Kaya nutrisi'],
      contraindications: [
        {
          condition: 'Kolesterol',
          reason: 'Tinggi kolesterol',
          severity: 'caution',
        },
      ],
      commonPreparations: ['Goreng', 'Rebus', 'Telur dadar'],
      cookingTips: 'Batasi 3-4 butir per minggu untuk kondisi kolesterol',
    },

    // VEGETABLES
    {
      name: 'Bayam',
      commonNames: ['Spinach', 'Spinacea oleracea'],
      category: 'vegetables',
      origin: 'All',
      calories: 23,
      proteinG: 2.7,
      carbsG: 3.6,
      fiberG: 2.2,
      fatG: 0.4,
      saturatedFatG: 0.1,
      sodiumMg: 79,
      sugarG: 0.4,
      calcium: 99,
      iron: 2.7,
      magnesium: 79,
      potassium: 558,
      vitaminK: 144,
      vitaminA: 469,
      isVegetarian: true,
      isVegan: true,
      isHalal: true,
      commonAllergies: [],
      benefits: [
        'Tinggi zat besi',
        'Potassium untuk hipertensi',
        'Kaya vitamin K untuk kesehatan tulang',
      ],
      commonPreparations: ['Tumis', 'Sup', 'Urap'],
      cookingTips:
        'Masak singkat agar nutrisi tidak hilang, sempurna untuk penderita hipertensi',
      culturalSignificance: [
        {
          culture: 'Jawa',
          usages: ['Everyday'],
        },
      ],
    },

    {
      name: 'Kacang Panjang (Buncis)',
      commonNames: ['Long bean', 'Yard-long bean'],
      category: 'vegetables',
      origin: 'All',
      calories: 31,
      proteinG: 2.1,
      carbsG: 7,
      fiberG: 2.4,
      fatG: 0.2,
      saturatedFatG: 0.1,
      sodiumMg: 2,
      sugarG: 1.5,
      calcium: 37,
      iron: 1.1,
      magnesium: 24,
      potassium: 179,
      isVegetarian: true,
      isVegan: true,
      isHalal: true,
      commonAllergies: [],
      benefits: ['Rendah kalori', 'Serat tinggi untuk diabetes', 'Rendah sodium'],
      commonPreparations: ['Tumis', 'Rebus', 'Pecel'],
      cookingTips: 'Jangan masak terlalu lama, ideal untuk diet',
      culturalSignificance: [
        {
          culture: 'All',
          usages: ['Everyday'],
        },
      ],
    },

    // GRAINS
    {
      name: 'Beras Coklat (Brown Rice)',
      commonNames: ['Beras merah', 'Whole grain rice'],
      category: 'grains',
      origin: 'All',
      calories: 111,
      proteinG: 2.6,
      carbsG: 23,
      fiberG: 1.8,
      fatG: 0.9,
      saturatedFatG: 0.3,
      sodiumMg: 5,
      sugarG: 0,
      magnesium: 84,
      manganese: 1.8,
      phosphorus: 263,
      isVegetarian: true,
      isVegan: true,
      isHalal: true,
      commonAllergies: [],
      benefits: ['Indeks glikemik rendah', 'Serat tinggi', 'Untuk diabetes'],
      commonPreparations: ['Nasi', 'Bubur'],
      cookingTips: 'Masak lebih lama dari beras putih, hasil lebih kenyal',
      culturalSignificance: [
        {
          culture: 'All',
          usages: ['Everyday'],
        },
      ],
    },

    // FRUITS
    {
      name: 'Pisang Mas (Golden Banana)',
      commonNames: ['Pisang', 'Yellow banana'],
      category: 'fruits',
      origin: 'All',
      calories: 89,
      proteinG: 1.1,
      carbsG: 23,
      fiberG: 2.6,
      fatG: 0.3,
      saturatedFatG: 0.1,
      sodiumMg: 1,
      sugarG: 12,
      potassium: 358,
      vitaminB6: 0.4,
      vitaminC: 8.7,
      isVegetarian: true,
      isVegan: true,
      isHalal: true,
      commonAllergies: [],
      benefits: [
        'Potassium tinggi untuk hipertensi',
        'Energi cepat',
        'Mudah dicerna',
      ],
      commonPreparations: ['Dimakan segar', 'Digoreng', 'Diabadol'],
      cookingTips:
        'Sempurna untuk snack sehat, potassium membantu menurunkan tekanan darah',
      culturalSignificance: [
        {
          culture: 'All',
          usages: ['Everyday', 'Snack'],
        },
      ],
    },

    // SPICES
    {
      name: 'Kunyit (Turmeric)',
      commonNames: ['Kunyit', 'Turmeric root'],
      category: 'spices',
      origin: 'All',
      calories: 354,
      proteinG: 9.7,
      carbsG: 64,
      fiberG: 21,
      fatG: 9.9,
      saturatedFatG: 3,
      sodiumMg: 38,
      sugarG: 3,
      iron: 41,
      manganese: 19.8,
      curcumin: 3.14,
      isVegetarian: true,
      isVegan: true,
      isHalal: true,
      commonAllergies: [],
      benefits: [
        'Anti-inflamasi kuat',
        'Menurunkan kolesterol',
        'Tradisional untuk kesehatan',
      ],
      commonPreparations: ['Bumbu masakan', 'Jamu', 'Minuman'],
      cookingTips:
        'Gunakan dalam porsi kecil untuk bumbu, dipercaya menurunkan peradangan',
      culturalSignificance: [
        {
          culture: 'All',
          usages: ['Medicinal', 'Everyday'],
        },
      ],
    },

    {
      name: 'Jahe (Ginger)',
      commonNames: ['Jahe merah', 'Red ginger'],
      category: 'spices',
      origin: 'All',
      calories: 80,
      proteinG: 1.8,
      carbsG: 18,
      fiberG: 2.4,
      fatG: 0.8,
      sodiumMg: 13,
      sugarG: 1.7,
      potassium: 415,
      manganese: 0.2,
      gingerol: 1.5,
      isVegetarian: true,
      isVegan: true,
      isHalal: true,
      commonAllergies: [],
      benefits: [
        'Anti mual',
        'Anti inflamasi',
        'Meningkatkan pencernaan',
      ],
      commonPreparations: ['Teh jahe', 'Bumbu masakan', 'Jamu'],
      cookingTips:
        'Rebus dengan air panas untuk teh anti mual, aman untuk ibu hamil',
      culturalSignificance: [
        {
          culture: 'All',
          usages: ['Medicinal', 'Everyday'],
        },
      ],
    },
  ];

  // Create local foods
  for (const food of localFoods) {
    await prisma.localFood.upsert({
      where: { name: food.name },
      update: {},
      create: {
        ...food,
        contraindications: food.contraindications as any,
        culturalSignificance: food.culturalSignificance as any,
      } as any,
    });
  }

  logger.info(`Seeded ${localFoods.length} local foods`);
}

/**
 * Seed sample meals
 */
async function seedMeals() {
  logger.info('Seeding sample meals...');

  const meals = [
    {
      name: 'Nasi Kuning Jawa',
      description: 'Nasi dengan bumbu kunyit dan santan',
      portion: '1 porsi (150g)',
      calories: 300,
      proteinG: 6,
      carbsG: 52,
      fiberG: 1,
      fatG: 8,
      sodiumMg: 250,
      sugarG: 0,
      isLocalFood: true,
      isCultureApproved: true,
      preparationTips: 'Gunakan beras coklat untuk lebih sehat',
      culturalSignificance:
        'Menu tradisional Jawa yang sering disajikan untuk acara',
    },

    {
      name: 'Pecel Jawa',
      description: 'Sayuran dengan saus kacang kental',
      portion: '1 piring',
      calories: 180,
      proteinG: 8,
      carbsG: 24,
      fiberG: 5,
      fatG: 6,
      sodiumMg: 400,
      sugarG: 3,
      isLocalFood: true,
      isCultureApproved: true,
      preparationTips: 'Saus kacang buat sendiri untuk kurangi sodium',
      culturalSignificance:
        'Makanan murah meriah yang bergizi, cocok untuk semua',
    },
  ];

  for (const meal of meals) {
    await prisma.meal.upsert({
      where: { name: meal.name },
      update: {},
      create: meal,
    });
  }

  logger.info(`Seeded ${meals.length} meals`);
}

async function main() {
  try {
    logger.info('Starting database seed...');

    await seedLocalFoods();
    await seedMeals();

    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding database:', error);
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
