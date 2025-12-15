
import { validateWithKnowledge } from '../services/ragService.js';
import { getBestNutritionData } from '../services/groundTruthService.js';
import logger from '../config/logger.js';
import path from 'path';

// Mock user for RAG test
const mockUser = {
    gender: 'male',
    age: 25,
    currentWeightKg: 70,
    heightCm: 175,
    medicalConditions: [],
    activityLevel: 'moderate'
};

// Mock Meal Plan Summary
const mockMealPlan = {
    totalCalories: 2100, // Slightly over 2000 standard?
    totalProtein: 70,
    totalCarbs: 300,
    totalFat: 60
};

async function runTests() {
    console.log('\n=== 1. TESTING GROUND TRUTH SERVICE (Single Food) ===');
    try {
        const foodName = 'Nasi Goreng';
        console.log(`Searching for: ${foodName}...`);
        const result = await getBestNutritionData(foodName);
        console.log('Result:', JSON.stringify(result, null, 2));

        if (result.source === 'ground_truth') {
            console.log('✅ PASS: Found in local database!');
        } else {
            console.log('⚠️ NOTE: Not found in DB, estimated by LLM.');
        }
    } catch (error) {
        console.error('❌ FAIL: Ground Truth Service error', error);
    }

    console.log('\n=== 2. TESTING RAG SERVICE (PDF Compliance) ===');
    console.log('Reading "Permenkes Nomor 28 Tahun 2019.pdf"...');
    try {
        const result = await validateWithKnowledge(mockUser, mockMealPlan);
        console.log('RAG Result:', JSON.stringify(result, null, 2));

        if (result.score > 0) {
            console.log(`✅ PASS: Compliance Score Generated: ${result.score}/100`);
            console.log(`   Details: ${result.details}`);
        } else {
            console.log('❌ FAIL: Score is 0 or invalid');
        }
    } catch (error) {
        console.error('❌ FAIL: RAG Service error', error);
    }
}

// Execute
runTests().catch(console.error);
