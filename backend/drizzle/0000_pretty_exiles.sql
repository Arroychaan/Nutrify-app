CREATE TABLE "biomarker_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"recordedAt" timestamp NOT NULL,
	"weightKg" numeric(5, 2),
	"heightCm" numeric(5, 2),
	"bmi" numeric(5, 2),
	"systolicBp" integer,
	"diastolicBp" integer,
	"bpMeasurementTime" text,
	"bloodGlucose" integer,
	"hba1c" numeric(5, 2),
	"totalCholesterol" integer,
	"ldlCholesterol" integer,
	"hdlCholesterol" integer,
	"triglycerides" integer,
	"notes" text,
	"source" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversationId" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"structuredData" jsonb,
	"llmModel" text,
	"tokensUsed" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"sessionId" text,
	"currentMealPlanId" uuid,
	"topic" text,
	"isArchived" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_alternatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mealId" uuid NOT NULL,
	"alternativeFoodId" uuid NOT NULL,
	"reason" text NOT NULL,
	"substitutionRatio" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"mealType" text NOT NULL,
	"foodName" text NOT NULL,
	"portion" text,
	"calories" numeric(10, 2),
	"proteinG" numeric(10, 2),
	"carbsG" numeric(10, 2),
	"fatG" numeric(10, 2),
	"fiberG" numeric(10, 2),
	"sodiumMg" numeric(10, 2),
	"sugarG" numeric(10, 2),
	"loggedAt" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"imageUrl" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpi_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"metricName" text NOT NULL,
	"metricValue" numeric(10, 2) NOT NULL,
	"periodStart" timestamp NOT NULL,
	"periodEnd" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"commonNames" text[] DEFAULT '{}'::text[] NOT NULL,
	"category" text NOT NULL,
	"origin" text,
	"calories" numeric(10, 2) NOT NULL,
	"proteinG" numeric(10, 2) NOT NULL,
	"carbsG" numeric(10, 2) NOT NULL,
	"fiberG" numeric(10, 2),
	"fatG" numeric(10, 2) NOT NULL,
	"saturatedFatG" numeric(10, 2),
	"sodiumMg" numeric(10, 2) NOT NULL,
	"sugarG" numeric(10, 2),
	"cholesterolMg" numeric(10, 2),
	"vitaminC" numeric(10, 2),
	"vitaminD" numeric(10, 2),
	"vitaminE" numeric(10, 2),
	"vitaminK" numeric(10, 2),
	"vitaminA" numeric(10, 2),
	"calcium" numeric(10, 2),
	"iron" numeric(10, 2),
	"magnesium" numeric(10, 2),
	"phosphorus" numeric(10, 2),
	"potassium" numeric(10, 2),
	"zinc" numeric(10, 2),
	"seasonsAvailable" text[] DEFAULT '{}'::text[] NOT NULL,
	"estimatedCostPerKgRp" integer,
	"storageLife" text,
	"isVegetarian" boolean DEFAULT false NOT NULL,
	"isVegan" boolean DEFAULT false NOT NULL,
	"isHalal" boolean DEFAULT true NOT NULL,
	"isKosher" boolean DEFAULT false,
	"commonAllergies" text[] DEFAULT '{}'::text[] NOT NULL,
	"contraindications" jsonb,
	"benefits" text[] DEFAULT '{}'::text[] NOT NULL,
	"culturalSignificance" jsonb,
	"commonPreparations" text[] DEFAULT '{}'::text[] NOT NULL,
	"cookingTips" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mealId" uuid NOT NULL,
	"foodId" uuid NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_day_meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mealPlanDayId" uuid NOT NULL,
	"mealId" uuid NOT NULL,
	"mealType" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mealPlanId" uuid NOT NULL,
	"mealDate" timestamp NOT NULL,
	"dayNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mealPlanId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"rating" numeric(3, 1),
	"adherenceScore" numeric(5, 2),
	"feedback" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"duration" text NOT NULL,
	"avgCalories" numeric(10, 2) NOT NULL,
	"avgProteinG" numeric(10, 2) NOT NULL,
	"avgCarbsG" numeric(10, 2) NOT NULL,
	"avgFatG" numeric(10, 2) NOT NULL,
	"avgSodiumMg" numeric(10, 2) NOT NULL,
	"avgSugarG" numeric(10, 2),
	"akgCompliance" numeric(5, 2) NOT NULL,
	"localFoodPercentage" numeric(5, 2) NOT NULL,
	"medicalSafetyScore" numeric(5, 2) NOT NULL,
	"userRating" numeric(3, 1),
	"adherenceScore" numeric(5, 2),
	"userFeedback" text,
	"generatedBy" text DEFAULT 'llm' NOT NULL,
	"llmPromptUsed" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"portion" text NOT NULL,
	"calories" numeric(10, 2) NOT NULL,
	"proteinG" numeric(10, 2) NOT NULL,
	"carbsG" numeric(10, 2) NOT NULL,
	"fiberG" numeric(10, 2),
	"fatG" numeric(10, 2) NOT NULL,
	"saturatedFatG" numeric(10, 2),
	"sodiumMg" numeric(10, 2) NOT NULL,
	"sugarG" numeric(10, 2),
	"cholesterolMg" numeric(10, 2),
	"vitaminC" numeric(10, 2),
	"vitaminD" numeric(10, 2),
	"vitaminE" numeric(10, 2),
	"vitaminK" numeric(10, 2),
	"vitaminA" numeric(10, 2),
	"calcium" numeric(10, 2),
	"iron" numeric(10, 2),
	"magnesium" numeric(10, 2),
	"phosphorus" numeric(10, 2),
	"potassium" numeric(10, 2),
	"zinc" numeric(10, 2),
	"isLocalFood" boolean DEFAULT true NOT NULL,
	"isCultureApproved" boolean DEFAULT false NOT NULL,
	"medicalSafetyNotes" text,
	"preparationTips" text,
	"culturalSignificance" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"sentAt" timestamp DEFAULT now() NOT NULL,
	"successCount" integer DEFAULT 0 NOT NULL,
	"failedCount" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"mealReminders" boolean DEFAULT true NOT NULL,
	"streakReminders" boolean DEFAULT true NOT NULL,
	"goalProgress" boolean DEFAULT true NOT NULL,
	"dailyTips" boolean DEFAULT true NOT NULL,
	"weeklyReport" boolean DEFAULT true NOT NULL,
	"breakfastTime" text DEFAULT '07:00' NOT NULL,
	"lunchTime" text DEFAULT '12:00' NOT NULL,
	"dinnerTime" text DEFAULT '19:00' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_settings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"platform" text,
	"browser" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "user_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"dailyCalorieTarget" integer DEFAULT 2000 NOT NULL,
	"dailyBudget" integer DEFAULT 50000 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_targets_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "user_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"name" text NOT NULL,
	"amount" integer NOT NULL,
	"category" text NOT NULL,
	"transactionDate" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text NOT NULL,
	"fullName" text NOT NULL,
	"dateOfBirth" timestamp,
	"gender" text,
	"phoneNumber" text,
	"isVerified" boolean DEFAULT false NOT NULL,
	"verificationToken" text,
	"verificationExpires" timestamp,
	"resetPasswordToken" text,
	"resetPasswordExpires" timestamp,
	"heightCm" numeric(5, 2) NOT NULL,
	"currentWeightKg" numeric(5, 2) NOT NULL,
	"targetWeightKg" numeric(5, 2),
	"activityLevel" text DEFAULT 'moderate' NOT NULL,
	"culture" text,
	"religion" text,
	"medicalConditions" text[] DEFAULT '{}'::text[] NOT NULL,
	"medications" text[] DEFAULT '{}'::text[] NOT NULL,
	"allergies" text[] DEFAULT '{}'::text[] NOT NULL,
	"dietaryRestrictions" text[] DEFAULT '{}'::text[] NOT NULL,
	"dislikes" text[] DEFAULT '{}'::text[] NOT NULL,
	"streakDays" integer DEFAULT 0 NOT NULL,
	"badges" text[] DEFAULT '{}'::text[] NOT NULL,
	"privacyConsent" boolean DEFAULT false NOT NULL,
	"dataUsageConsent" boolean DEFAULT false NOT NULL,
	"twoFactorSecret" text,
	"isTwoFactorEnabled" boolean DEFAULT false NOT NULL,
	"backupCodes" text[] DEFAULT '{}'::text[] NOT NULL,
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastActiveAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "biomarker_records" ADD CONSTRAINT "biomarker_records_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_currentMealPlanId_meal_plans_id_fk" FOREIGN KEY ("currentMealPlanId") REFERENCES "public"."meal_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_alternatives" ADD CONSTRAINT "food_alternatives_mealId_meals_id_fk" FOREIGN KEY ("mealId") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_alternatives" ADD CONSTRAINT "food_alternatives_alternativeFoodId_local_foods_id_fk" FOREIGN KEY ("alternativeFoodId") REFERENCES "public"."local_foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_logs" ADD CONSTRAINT "food_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_metrics" ADD CONSTRAINT "kpi_metrics_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_ingredients" ADD CONSTRAINT "meal_ingredients_mealId_meals_id_fk" FOREIGN KEY ("mealId") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_ingredients" ADD CONSTRAINT "meal_ingredients_foodId_local_foods_id_fk" FOREIGN KEY ("foodId") REFERENCES "public"."local_foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_day_meals" ADD CONSTRAINT "meal_plan_day_meals_mealPlanDayId_meal_plan_days_id_fk" FOREIGN KEY ("mealPlanDayId") REFERENCES "public"."meal_plan_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_day_meals" ADD CONSTRAINT "meal_plan_day_meals_mealId_meals_id_fk" FOREIGN KEY ("mealId") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_days" ADD CONSTRAINT "meal_plan_days_mealPlanId_meal_plans_id_fk" FOREIGN KEY ("mealPlanId") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_feedback" ADD CONSTRAINT "meal_plan_feedback_mealPlanId_meal_plans_id_fk" FOREIGN KEY ("mealPlanId") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_feedback" ADD CONSTRAINT "meal_plan_feedback_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_targets" ADD CONSTRAINT "user_targets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;