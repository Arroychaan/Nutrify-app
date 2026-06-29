import {
  pgTable,
  uuid,
  text,
  boolean,
  decimal,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

// ============================================================================
// USER MANAGEMENT MODELS
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('passwordHash').notNull(),
  fullName: text('fullName').notNull(),
  dateOfBirth: timestamp('dateOfBirth'),
  gender: text('gender'),
  phoneNumber: text('phoneNumber'),
  isVerified: boolean('isVerified').default(false).notNull(),
  verificationToken: text('verificationToken'),
  verificationExpires: timestamp('verificationExpires'),
  resetPasswordToken: text('resetPasswordToken'),
  resetPasswordExpires: timestamp('resetPasswordExpires'),
  heightCm: decimal('heightCm', { precision: 5, scale: 2 }).notNull(),
  currentWeightKg: decimal('currentWeightKg', {
    precision: 5,
    scale: 2,
  }).notNull(),
  targetWeightKg: decimal('targetWeightKg', { precision: 5, scale: 2 }),
  activityLevel: text('activityLevel').default('moderate').notNull(), // sedentary, light, moderate, active, very_active
  culture: text('culture'), // Jawa, Sunda, Minang, Bugis, Batak, Bali, Betawi
  religion: text('religion'), // Islam, Kristen, Katolik, Hindu, Buddha
  medicalConditions: text('medicalConditions')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  medications: text('medications')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  allergies: text('allergies')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  dietaryRestrictions: text('dietaryRestrictions')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  dislikes: text('dislikes')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  streakDays: integer('streakDays').default(0).notNull(),
  badges: text('badges')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  privacyConsent: boolean('privacyConsent').default(false).notNull(),
  dataUsageConsent: boolean('dataUsageConsent').default(false).notNull(),
  twoFactorSecret: text('twoFactorSecret'),
  isTwoFactorEnabled: boolean('isTwoFactorEnabled').default(false).notNull(),
  backupCodes: text('backupCodes')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  deletedAt: timestamp('deletedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  lastActiveAt: timestamp('lastActiveAt').defaultNow().notNull(),
});

// ============================================================================
// MEAL PLAN MODELS
// ============================================================================

export const mealPlans = pgTable('meal_plans', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate').notNull(),
  duration: text('duration').notNull(), // 1_day, 3_days, 7_days, 14_days, 28_days
  avgCalories: decimal('avgCalories', { precision: 10, scale: 2 }).notNull(),
  avgProteinG: decimal('avgProteinG', { precision: 10, scale: 2 }).notNull(),
  avgCarbsG: decimal('avgCarbsG', { precision: 10, scale: 2 }).notNull(),
  avgFatG: decimal('avgFatG', { precision: 10, scale: 2 }).notNull(),
  avgSodiumMg: decimal('avgSodiumMg', { precision: 10, scale: 2 }).notNull(),
  avgSugarG: decimal('avgSugarG', { precision: 10, scale: 2 }),
  akgCompliance: decimal('akgCompliance', { precision: 5, scale: 2 }).notNull(),
  localFoodPercentage: decimal('localFoodPercentage', {
    precision: 5,
    scale: 2,
  }).notNull(),
  medicalSafetyScore: decimal('medicalSafetyScore', {
    precision: 5,
    scale: 2,
  }).notNull(),
  userRating: decimal('userRating', { precision: 3, scale: 1 }),
  adherenceScore: decimal('adherenceScore', { precision: 5, scale: 2 }),
  userFeedback: text('userFeedback'),
  generatedBy: text('generatedBy').default('llm').notNull(), // llm, manual
  llmPromptUsed: text('llmPromptUsed'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const mealPlanDays = pgTable('meal_plan_days', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  mealPlanId: uuid('mealPlanId')
    .references(() => mealPlans.id, { onDelete: 'cascade' })
    .notNull(),
  mealDate: timestamp('mealDate').notNull(),
  dayNotes: text('dayNotes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const meals = pgTable('meals', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  portion: text('portion').notNull(),
  calories: decimal('calories', { precision: 10, scale: 2 }).notNull(),
  proteinG: decimal('proteinG', { precision: 10, scale: 2 }).notNull(),
  carbsG: decimal('carbsG', { precision: 10, scale: 2 }).notNull(),
  fiberG: decimal('fiberG', { precision: 10, scale: 2 }),
  fatG: decimal('fatG', { precision: 10, scale: 2 }).notNull(),
  saturatedFatG: decimal('saturatedFatG', { precision: 10, scale: 2 }),
  sodiumMg: decimal('sodiumMg', { precision: 10, scale: 2 }).notNull(),
  sugarG: decimal('sugarG', { precision: 10, scale: 2 }),
  cholesterolMg: decimal('cholesterolMg', { precision: 10, scale: 2 }),
  vitaminC: decimal('vitaminC', { precision: 10, scale: 2 }),
  vitaminD: decimal('vitaminD', { precision: 10, scale: 2 }),
  vitaminE: decimal('vitaminE', { precision: 10, scale: 2 }),
  vitaminK: decimal('vitaminK', { precision: 10, scale: 2 }),
  vitaminA: decimal('vitaminA', { precision: 10, scale: 2 }),
  calcium: decimal('calcium', { precision: 10, scale: 2 }),
  iron: decimal('iron', { precision: 10, scale: 2 }),
  magnesium: decimal('magnesium', { precision: 10, scale: 2 }),
  phosphorus: decimal('phosphorus', { precision: 10, scale: 2 }),
  potassium: decimal('potassium', { precision: 10, scale: 2 }),
  zinc: decimal('zinc', { precision: 10, scale: 2 }),
  isLocalFood: boolean('isLocalFood').default(true).notNull(),
  isCultureApproved: boolean('isCultureApproved').default(false).notNull(),
  medicalSafetyNotes: text('medicalSafetyNotes'),
  preparationTips: text('preparationTips'),
  culturalSignificance: text('culturalSignificance'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const localFoods = pgTable('local_foods', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text('name').notNull(),
  commonNames: text('commonNames')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  category: text('category').notNull(), // grains, proteins, vegetables, fruits, dairy, oils, herbs, spices
  origin: text('origin'),
  calories: decimal('calories', { precision: 10, scale: 2 }).notNull(),
  proteinG: decimal('proteinG', { precision: 10, scale: 2 }).notNull(),
  carbsG: decimal('carbsG', { precision: 10, scale: 2 }).notNull(),
  fiberG: decimal('fiberG', { precision: 10, scale: 2 }),
  fatG: decimal('fatG', { precision: 10, scale: 2 }).notNull(),
  saturatedFatG: decimal('saturatedFatG', { precision: 10, scale: 2 }),
  sodiumMg: decimal('sodiumMg', { precision: 10, scale: 2 }).notNull(),
  sugarG: decimal('sugarG', { precision: 10, scale: 2 }),
  cholesterolMg: decimal('cholesterolMg', { precision: 10, scale: 2 }),
  vitaminC: decimal('vitaminC', { precision: 10, scale: 2 }),
  vitaminD: decimal('vitaminD', { precision: 10, scale: 2 }),
  vitaminE: decimal('vitaminE', { precision: 10, scale: 2 }),
  vitaminK: decimal('vitaminK', { precision: 10, scale: 2 }),
  vitaminA: decimal('vitaminA', { precision: 10, scale: 2 }),
  calcium: decimal('calcium', { precision: 10, scale: 2 }),
  iron: decimal('iron', { precision: 10, scale: 2 }),
  magnesium: decimal('magnesium', { precision: 10, scale: 2 }),
  phosphorus: decimal('phosphorus', { precision: 10, scale: 2 }),
  potassium: decimal('potassium', { precision: 10, scale: 2 }),
  zinc: decimal('zinc', { precision: 10, scale: 2 }),
  seasonsAvailable: text('seasonsAvailable')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  estimatedCostPerKgRp: integer('estimatedCostPerKgRp'),
  storageLife: text('storageLife'),
  isVegetarian: boolean('isVegetarian').default(false).notNull(),
  isVegan: boolean('isVegan').default(false).notNull(),
  isHalal: boolean('isHalal').default(true).notNull(),
  isKosher: boolean('isKosher').default(false),
  commonAllergies: text('commonAllergies')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  contraindications: jsonb('contraindications'), // [{condition, reason, severity}]
  benefits: text('benefits')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  culturalSignificance: jsonb('culturalSignificance'), // [{culture, usages}]
  commonPreparations: text('commonPreparations')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  cookingTips: text('cookingTips'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const mealIngredients = pgTable('meal_ingredients', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  mealId: uuid('mealId')
    .references(() => meals.id, { onDelete: 'cascade' })
    .notNull(),
  foodId: uuid('foodId')
    .references(() => localFoods.id)
    .notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: text('unit').notNull(), // g, ml, pcs, cup, etc
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const mealPlanDayMeals = pgTable('meal_plan_day_meals', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  mealPlanDayId: uuid('mealPlanDayId')
    .references(() => mealPlanDays.id, { onDelete: 'cascade' })
    .notNull(),
  mealId: uuid('mealId')
    .references(() => meals.id)
    .notNull(),
  mealType: text('mealType').notNull(), // breakfast, lunch, dinner, snack
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const foodAlternatives = pgTable('food_alternatives', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  mealId: uuid('mealId')
    .references(() => meals.id, { onDelete: 'cascade' })
    .notNull(),
  alternativeFoodId: uuid('alternativeFoodId')
    .references(() => localFoods.id)
    .notNull(),
  reason: text('reason').notNull(),
  substitutionRatio: text('substitutionRatio'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// ============================================================================
// BIOMARKER MODELS
// ============================================================================

export const biomarkerRecords = pgTable('biomarker_records', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  recordedAt: timestamp('recordedAt').notNull(),
  weightKg: decimal('weightKg', { precision: 5, scale: 2 }),
  heightCm: decimal('heightCm', { precision: 5, scale: 2 }),
  bmi: decimal('bmi', { precision: 5, scale: 2 }),
  systolicBp: integer('systolicBp'),
  diastolicBp: integer('diastolicBp'),
  bpMeasurementTime: text('bpMeasurementTime'),
  bloodGlucose: integer('bloodGlucose'),
  hba1c: decimal('hba1c', { precision: 5, scale: 2 }),
  totalCholesterol: integer('totalCholesterol'),
  ldlCholesterol: integer('ldlCholesterol'),
  hdlCholesterol: integer('hdlCholesterol'),
  triglycerides: integer('triglycerides'),
  notes: text('notes'),
  source: text('source').notNull(), // user_input, wearable, lab_test, hospital
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// ============================================================================
// CHAT MODELS
// ============================================================================

export const conversations = pgTable('conversations', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  sessionId: text('sessionId'),
  currentMealPlanId: uuid('currentMealPlanId').references(() => mealPlans.id, {
    onDelete: 'set null',
  }),
  topic: text('topic'),
  isArchived: boolean('isArchived').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  conversationId: uuid('conversationId')
    .references(() => conversations.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(), // user, assistant
  content: text('content').notNull(),
  structuredData: jsonb('structuredData'),
  llmModel: text('llmModel'),
  tokensUsed: integer('tokensUsed'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// ============================================================================
// FOOD LOGGING MODELS
// ============================================================================

export const foodLogs = pgTable('food_logs', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  mealType: text('mealType').notNull(),
  foodName: text('foodName').notNull(),
  portion: text('portion'),
  calories: decimal('calories', { precision: 10, scale: 2 }),
  proteinG: decimal('proteinG', { precision: 10, scale: 2 }),
  carbsG: decimal('carbsG', { precision: 10, scale: 2 }),
  fatG: decimal('fatG', { precision: 10, scale: 2 }),
  fiberG: decimal('fiberG', { precision: 10, scale: 2 }),
  sodiumMg: decimal('sodiumMg', { precision: 10, scale: 2 }),
  sugarG: decimal('sugarG', { precision: 10, scale: 2 }),
  loggedAt: timestamp('loggedAt').defaultNow().notNull(),
  notes: text('notes'),
  imageUrl: text('imageUrl'),
  source: text('source').default('manual').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// ============================================================================
// FEEDBACK & ANALYTICS MODELS
// ============================================================================

export const mealPlanFeedback = pgTable('meal_plan_feedback', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  mealPlanId: uuid('mealPlanId')
    .references(() => mealPlans.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  rating: decimal('rating', { precision: 3, scale: 1 }),
  adherenceScore: decimal('adherenceScore', { precision: 5, scale: 2 }),
  feedback: text('feedback'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const kpiMetrics = pgTable('kpi_metrics', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('userId').references(() => users.id, { onDelete: 'cascade' }),
  metricName: text('metricName').notNull(), // adherence_rate, akg_compliance, etc
  metricValue: decimal('metricValue', { precision: 10, scale: 2 }).notNull(),
  periodStart: timestamp('periodStart').notNull(),
  periodEnd: timestamp('periodEnd').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// ============================================================================
// PUSH NOTIFICATION MODELS
// ============================================================================

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  endpoint: text('endpoint').unique().notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  platform: text('platform'),
  browser: text('browser'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // REMINDER, WARNING, INFO
  isRead: boolean('isRead').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const notificationSettings = pgTable('notification_settings', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),
  mealReminders: boolean('mealReminders').default(true).notNull(),
  streakReminders: boolean('streakReminders').default(true).notNull(),
  goalProgress: boolean('goalProgress').default(true).notNull(),
  dailyTips: boolean('dailyTips').default(true).notNull(),
  weeklyReport: boolean('weeklyReport').default(true).notNull(),
  breakfastTime: text('breakfastTime').default('07:00').notNull(),
  lunchTime: text('lunchTime').default('12:00').notNull(),
  dinnerTime: text('dinnerTime').default('19:00').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const notificationLogs = pgTable('notification_logs', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(), // meal_reminder, streak_warning, etc
  title: text('title').notNull(),
  body: text('body').notNull(),
  sentAt: timestamp('sentAt').defaultNow().notNull(),
  successCount: integer('successCount').default(0).notNull(),
  failedCount: integer('failedCount').default(0).notNull(),
});

// ============================================================================
// RELATION DEFINITIONS FOR DRIZZLE-ORM (Optional but helpful)
// ============================================================================

export const usersRelations = relations(users, ({ many, one }) => ({
  biomarkers: many(biomarkerRecords),
  mealPlans: many(mealPlans),
  conversations: many(conversations),
  feedback: many(mealPlanFeedback),
  foodLogs: many(foodLogs),
  pushSubscriptions: many(pushSubscriptions),
  notificationSettings: one(notificationSettings, {
    fields: [users.id],
    references: [notificationSettings.userId],
  }),
  notificationLogs: many(notificationLogs),
  notifications: many(notifications),
}));

export const mealPlansRelations = relations(mealPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [mealPlans.userId],
    references: [users.id],
  }),
  days: many(mealPlanDays),
  feedback: many(mealPlanFeedback),
  conversations: many(conversations),
}));

export const mealPlanDaysRelations = relations(
  mealPlanDays,
  ({ one, many }) => ({
    mealPlan: one(mealPlans, {
      fields: [mealPlanDays.mealPlanId],
      references: [mealPlans.id],
    }),
    meals: many(mealPlanDayMeals),
  }),
);

export const mealsRelations = relations(meals, ({ many }) => ({
  ingredients: many(mealIngredients),
  dayMeals: many(mealPlanDayMeals),
  alternatives: many(foodAlternatives),
}));

export const localFoodsRelations = relations(localFoods, ({ many }) => ({
  ingredients: many(mealIngredients),
  alternatives: many(foodAlternatives),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversations.userId],
      references: [users.id],
    }),
    mealPlan: one(mealPlans, {
      fields: [conversations.currentMealPlanId],
      references: [mealPlans.id],
    }),
    messages: many(chatMessages),
  }),
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [chatMessages.conversationId],
    references: [conversations.id],
  }),
}));

export const mealIngredientsRelations = relations(
  mealIngredients,
  ({ one }) => ({
    meal: one(meals, {
      fields: [mealIngredients.mealId],
      references: [meals.id],
    }),
    food: one(localFoods, {
      fields: [mealIngredients.foodId],
      references: [localFoods.id],
    }),
  }),
);

export const mealPlanDayMealsRelations = relations(
  mealPlanDayMeals,
  ({ one }) => ({
    day: one(mealPlanDays, {
      fields: [mealPlanDayMeals.mealPlanDayId],
      references: [mealPlanDays.id],
    }),
    meal: one(meals, {
      fields: [mealPlanDayMeals.mealId],
      references: [meals.id],
    }),
  }),
);
