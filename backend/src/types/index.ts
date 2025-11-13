// User Types
export type UserCulture =
  | 'Jawa'
  | 'Sunda'
  | 'Minang'
  | 'Bugis'
  | 'Batak'
  | 'Bali'
  | 'Betawi'
  | 'Other';

export type UserReligion =
  | 'Islam'
  | 'Kristen'
  | 'Katolik'
  | 'Hindu'
  | 'Buddha'
  | 'Other';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type Gender = 'M' | 'F' | 'Other';

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth?: Date;
  gender?: Gender;
  phoneNumber?: string;

  heightCm: number;
  currentWeightKg: number;
  targetWeightKg?: number;
  activityLevel: ActivityLevel;

  culture?: UserCulture;
  religion?: UserReligion;

  medicalConditions: string[];
  medications?: string[];
  allergies?: string[];
  dietaryRestrictions?: string[];
  dislikes?: string[];

  streakDays: number;
  badges: string[];

  privacyConsent: boolean;
  dataUsageConsent: boolean;

  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

// Meal Plan Types
export type MealPlanDuration =
  | '1_day'
  | '3_days'
  | '7_days'
  | '14_days'
  | '28_days';

export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack';

export interface INutrition {
  calories: number;
  proteinG: number;
  carbsG: number;
  fiberG?: number;
  fatG: number;
  saturatedFatG?: number;
  sodiumMg: number;
  sugarG?: number;
  cholesterolMg?: number;

  // Micronutrients
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminA?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  zinc?: number;
}

export interface IMeal {
  id: string;
  name: string;
  description?: string;
  portion: string;

  ingredients: {
    foodId: string;
    foodName: string;
    quantity: number;
    unit: string;
  }[];

  nutrition: INutrition;

  isLocalFood: boolean;
  isCultureApproved: boolean;
  medicalSafetyNotes?: string;

  alternatives?: {
    foodId: string;
    foodName: string;
    reason: string;
  }[];

  preparationTips?: string;
  culturalSignificance?: string;
}

export interface IMealDay {
  date: Date;
  meals: {
    breakfast?: IMeal;
    lunch?: IMeal;
    dinner?: IMeal;
    snacks?: IMeal[];
  };
  dayNotes?: string;
}

export interface IMealPlan {
  id: string;
  userId: string;

  startDate: Date;
  endDate: Date;
  duration: MealPlanDuration;

  meals: IMealDay[];

  avgCalories: number;
  avgProteinG: number;
  avgCarbsG: number;
  avgFatG: number;
  avgSodiumMg: number;
  avgSugarG?: number;

  akgCompliance: number;
  localFoodPercentage: number;
  medicalSafetyScore: number;

  userRating?: number;
  adherenceScore?: number;
  feedback?: string;

  generatedBy: 'llm' | 'manual';
  llmPromptUsed?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Food Database Types
export type FoodCategory =
  | 'grains'
  | 'proteins'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'oils'
  | 'herbs'
  | 'spices';

export type ContradictionSeverity = 'caution' | 'avoid' | 'limit';

export interface ILocalFood {
  id: string;
  name: string;
  commonNames: string[];

  category: FoodCategory;
  origin?: string;

  nutrition: INutrition;

  seasonsAvailable?: string[];
  estimatedCostPerKgRp?: number;
  storageLife?: string;

  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isKosher?: boolean;
  commonAllergies: string[];

  contraindications?: {
    condition: string;
    reason: string;
    severity: ContradictionSeverity;
  }[];

  benefits?: string[];

  culturalSignificance?: {
    culture: string;
    usages: string[];
  }[];

  commonPreparations: string[];
  cookingTips?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Biomarker Types
export interface IBiomarkerRecord {
  id: string;
  userId: string;
  recordedAt: Date;

  weightKg?: number;
  heightCm?: number;
  bmi?: number;

  bloodPressure?: {
    systolic: number;
    diastolic: number;
    measurementTime?: string;
  };

  bloodGlucose?: number;
  hba1c?: number;
  cholesterol?: {
    total?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
  };

  notes?: string;
  source: 'user_input' | 'wearable' | 'lab_test' | 'hospital';

  createdAt: Date;
}

// Chat Types
export type ConversationTopic =
  | 'meal_planning'
  | 'nutrition_education'
  | 'health_tracking'
  | 'general';

export interface IChatMessage {
  id: string;
  conversationId: string;

  role: 'user' | 'assistant';
  content: string;

  structuredData?: {
    type: 'meal_plan' | 'biomarker' | 'recommendation' | 'education';
    data: any;
  };

  llmModel?: string;
  tokensUsed?: number;

  createdAt: Date;
}

export interface IConversation {
  id: string;
  userId: string;
  sessionId?: string;

  messages: IChatMessage[];

  context?: {
    currentMealPlanId?: string;
    recentBiomarkers?: IBiomarkerRecord[];
    userPreferences?: Record<string, any>;
  };

  topic?: ConversationTopic;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

// API Response Types
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    version: string;
  };
}

export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth Types
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IJWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
