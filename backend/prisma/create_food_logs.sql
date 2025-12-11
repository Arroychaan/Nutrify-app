-- Create food_logs table
CREATE TABLE IF NOT EXISTS "food_logs" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "mealType" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "portion" TEXT,
    "calories" DECIMAL(10, 2),
    "proteinG" DECIMAL(10, 2),
    "carbsG" DECIMAL(10, 2),
    "fatG" DECIMAL(10, 2),
    "fiberG" DECIMAL(10, 2),
    "sodiumMg" DECIMAL(10, 2),
    "sugarG" DECIMAL(10, 2),
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "imageUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "food_logs_userId_loggedAt_idx" ON "food_logs"("userId", "loggedAt" DESC);
CREATE INDEX IF NOT EXISTS "food_logs_userId_mealType_idx" ON "food_logs"("userId", "mealType");
