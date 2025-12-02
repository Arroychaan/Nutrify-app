# 🏗️ Nutrify - System Architecture Documentation

> **AI Dietician for Indonesia** - Personalized Meal Planning System
> 
> **Last Updated:** December 2, 2025  
> **Version:** 1.0.0  
> **Status:** Backend Complete ✅ | Frontend In Progress 🚧

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Design](#architecture-design)
3. [Technology Stack](#technology-stack)
4. [Database Architecture](#database-architecture)
5. [API Architecture](#api-architecture)
6. [AI/LLM Integration](#aillm-integration)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Data Flow Diagrams](#data-flow-diagrams)
10. [Performance & Scalability](#performance--scalability)

---

## 🎯 System Overview

### Vision & Mission

**Nutrify** adalah aplikasi AI Dietician yang dirancang khusus untuk masyarakat Indonesia dengan fokus pada:

- ✅ **Personalisasi** - Meal plan disesuaikan dengan kondisi medis, budaya, dan preferensi
- ✅ **AKG Compliance** - Mengikuti Angka Kecukupan Gizi Indonesia
- ✅ **Makanan Lokal** - Minimal 60% menggunakan bahan lokal Indonesia
- ✅ **Aksesibilitas** - Budget-friendly dan mudah diakses
- ✅ **Medical Safety** - Tidak merekomendasikan makanan yang memperburuk kondisi

### Core Features

```
┌─────────────────────────────────────────────────────────┐
│                    NUTRIFY CORE FEATURES                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🤖 AI Chatbot                                          │
│     • Konsultasi gizi real-time                        │
│     • Edukasi nutrisi                                  │
│     • Q&A medical nutrition                            │
│                                                         │
│  🍽️  Meal Plan Generator                                │
│     • Personal meal plan (1-28 hari)                   │
│     • AKG compliance check                             │
│     • Medical condition validation                      │
│     • Budget optimization                              │
│                                                         │
│  📊 Health Tracking                                     │
│     • Biomarker monitoring (gula darah, kolesterol)    │
│     • BMI tracking                                     │
│     • Progress visualization                           │
│                                                         │
│  🎯 Smart Recommendations                               │
│     • Food alternatives                                │
│     • Cultural food suggestions                        │
│     • Meal prep tips                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🏛️ Architecture Design

### High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │   Web App       │    │  Mobile App     │                     │
│  │   (Next.js)     │    │  (React Native) │                     │
│  │   Port: 3000    │    │  (Future)       │                     │
│  └────────┬────────┘    └────────┬────────┘                     │
│           │                      │                               │
└───────────┼──────────────────────┼───────────────────────────────┘
            │                      │
            └──────────┬───────────┘
                       │ HTTPS/REST API
                       ▼
┌───────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │            Express.js API Server (Port 3001)                │ │
│  │                                                             │ │
│  │  • CORS Middleware                                         │ │
│  │  • Rate Limiting (100 req/15min)                          │ │
│  │  • Request Logger (Winston)                               │ │
│  │  • Authentication (JWT)                                    │ │
│  │  • Error Handler                                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                           │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   Controllers    │  │    Services      │  │    Engines     │ │
│  ├──────────────────┤  ├──────────────────┤  ├────────────────┤ │
│  │ • authController │  │ • llmService     │  │ • nutritionEng │ │
│  │ • chatController │  │   (Gemini AI)    │  │   (AKG Logic)  │ │
│  │ • mealPlanCtrl   │  │                  │  │                │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                    Prisma ORM                                ││
│  │  • Type-safe database client                                ││
│  │  • Auto-generated models                                    ││
│  │  • Query builder                                            ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                           │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   PostgreSQL     │  │     Redis        │  │   Gemini AI    │ │
│  │   (Supabase)     │  │   (Cache/Queue)  │  │   (Google AI)  │ │
│  │   Port: 5432     │  │   Port: 6379     │  │   API          │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Layer-by-Layer Explanation

#### 1. **Client Layer**
- **Web Application** (Next.js 14)
  - Server-Side Rendering (SSR)
  - Static Site Generation (SSG) untuk performa
  - React 18 dengan App Router
  - Tailwind CSS untuk styling
  - Zustand untuk state management

#### 2. **API Gateway Layer**
- **Express.js** sebagai HTTP server
- **Middleware Stack:**
  - `helmet` - Security headers
  - `cors` - Cross-Origin Resource Sharing
  - `express-rate-limit` - DDoS protection
  - `requestLogger` - Winston logging
  - `errorHandler` - Centralized error handling

#### 3. **Business Logic Layer**
- **Controllers:** Handle HTTP request/response
- **Services:** External integrations (LLM, Payment, etc)
- **Engines:** Core business logic (Nutrition calculations, AKG validation)

#### 4. **Data Access Layer**
- **Prisma ORM:**
  - Type-safe database queries
  - Automatic migrations
  - Schema as code
  - Query optimization

#### 5. **Infrastructure Layer**
- **PostgreSQL:** Primary database
- **Redis:** Caching & background jobs
- **Gemini AI:** LLM for meal plan generation & chat

---

## 💻 Technology Stack

### Backend Stack

```yaml
Runtime & Language:
  - Node.js: v20 LTS
  - TypeScript: v5.3 (Strict mode)
  - ES Modules: Native ESM support

Web Framework:
  - Express.js: v4.18
  - Express Rate Limit: v7.1
  - Helmet: v7.1 (Security)
  - CORS: v2.8

Database:
  - PostgreSQL: v15+
  - Prisma ORM: v5.20
  - Redis: v4.6 (Caching & Queue)

AI/LLM:
  - Google Gemini AI: gemini-1.5-flash
  - @google/generative-ai: v0.24

Authentication:
  - JWT: jsonwebtoken v9.0
  - Password Hashing: bcryptjs v2.4

Logging & Monitoring:
  - Winston: v3.11 (Structured logging)
  - Morgan: Request logging

Queue & Background Jobs:
  - Bull: v4.14 (Redis-based queue)

Validation:
  - Zod: v3.22 (Schema validation)
```

### Frontend Stack

```yaml
Framework:
  - Next.js: v14.2 (App Router)
  - React: v18.3
  - React DOM: v18.3

Language:
  - TypeScript: v5.5

Styling:
  - Tailwind CSS: v3.4
  - PostCSS: v8.4
  - Autoprefixer: v10.4

State Management:
  - Zustand: v4.5

HTTP Client:
  - Axios: v1.7

Forms:
  - React Hook Form: v7.53

Animation:
  - Framer Motion: v12.23

Utilities:
  - date-fns: v3.6 (Date manipulation)
```

### DevOps & Infrastructure

```yaml
Containerization:
  - Docker: For PostgreSQL & Redis
  - Docker Compose: Multi-container orchestration

Process Management:
  - PM2: Production process manager

Database Hosting:
  - Supabase: Managed PostgreSQL (Free tier)
  - Local Docker: Development

Deployment:
  - Heroku: Backend API (Free dyno)
  - Vercel: Frontend (Free tier)
  - Railway: Alternative backend hosting

Version Control:
  - Git: Source control
  - GitHub: Repository hosting

CI/CD:
  - GitHub Actions: Automated testing & deployment
```

---

## 🗄️ Database Architecture

### Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA (PostgreSQL)                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐           ┌──────────────────┐
│      User        │           │  BiomarkerRecord │
├──────────────────┤           ├──────────────────┤
│ id (UUID) PK     │───────────│ userId FK        │
│ email            │    1:N    │ recordedAt       │
│ passwordHash     │           │ weightKg         │
│ fullName         │           │ bloodGlucose     │
│ dateOfBirth      │           │ systolicBp       │
│ gender           │           │ totalCholesterol │
│ heightCm         │           └──────────────────┘
│ currentWeightKg  │
│ activityLevel    │           ┌──────────────────┐
│ culture          │           │   Conversation   │
│ medicalConditions│───────────├──────────────────┤
│ allergies        │    1:N    │ userId FK        │
│ dietaryRestric   │           │ sessionId        │
└──────────────────┘           │ topic            │
        │                      │ mealPlanId FK    │
        │ 1:N                  └──────────────────┘
        │                              │
        ▼                              │ 1:N
┌──────────────────┐                   ▼
│    MealPlan      │           ┌──────────────────┐
├──────────────────┤           │   ChatMessage    │
│ id (UUID) PK     │           ├──────────────────┤
│ userId FK        │           │ conversationId FK│
│ startDate        │           │ role             │
│ endDate          │           │ content          │
│ duration         │           │ llmModel         │
│ avgCalories      │           │ tokensUsed       │
│ avgProteinG      │           └──────────────────┘
│ avgSodiumMg      │
│ akgCompliance    │
│ localFoodPct     │
│ medicalSafety    │
└──────────────────┘
        │ 1:N
        ▼
┌──────────────────┐
│   MealPlanDay    │
├──────────────────┤
│ id (UUID) PK     │
│ mealPlanId FK    │
│ mealDate         │
│ dayNotes         │
└──────────────────┘
        │ 1:N
        ▼
┌──────────────────┐           ┌──────────────────┐
│ MealPlanDayMeal  │───────────│      Meal        │
├──────────────────┤    N:1    ├──────────────────┤
│ id (UUID) PK     │           │ id (UUID) PK     │
│ mealPlanDayId FK │           │ name             │
│ mealId FK        │           │ description      │
│ mealType         │           │ calories         │
└──────────────────┘           │ proteinG         │
                               │ carbsG           │
                               │ sodiumMg         │
                               │ isLocalFood      │
                               │ culturalSignif   │
                               └──────────────────┘
                                       │ 1:N
                                       ▼
                               ┌──────────────────┐
                               │ MealIngredient   │
                               ├──────────────────┤
                               │ id (UUID) PK     │
                               │ mealId FK        │
                               │ foodId FK        │
                               │ quantity         │
                               │ unit             │
                               └──────────────────┘
                                       │ N:1
                                       ▼
                               ┌──────────────────┐
                               │   LocalFood      │
                               ├──────────────────┤
                               │ id (UUID) PK     │
                               │ name             │
                               │ category         │
                               │ calories (per 100g)
                               │ proteinG         │
                               │ contraindications│
                               │ culturalSignif   │
                               │ origin           │
                               └──────────────────┘
```

### Database Tables Overview

#### **User Management**

1. **users** - User profiles & health data
   - Physical metrics (height, weight, BMI)
   - Medical conditions & allergies
   - Cultural & religious preferences
   - Activity level & goals

2. **biomarker_records** - Health tracking
   - Blood glucose, HbA1c
   - Blood pressure (systolic/diastolic)
   - Cholesterol (total, LDL, HDL, triglycerides)
   - Weight tracking over time

#### **Meal Planning**

3. **meal_plans** - Generated meal plans
   - Duration (1-28 days)
   - Nutrition summary (calories, macros)
   - Compliance scores (AKG, local food %)
   - User feedback & ratings

4. **meal_plan_days** - Daily meal schedule
   - Date-specific meals
   - Daily notes & tips

5. **meal_plan_day_meals** - Meal assignments
   - Meal type (breakfast, lunch, dinner, snack)
   - Links to actual meal recipes

6. **meals** - Meal recipes library
   - Complete nutrition data
   - Preparation tips
   - Cultural significance
   - Local food flag

7. **meal_ingredients** - Meal composition
   - Ingredient quantities
   - Units (grams, cups, pieces)

#### **Food Database**

8. **local_foods** - Indonesian food database
   - Nutrition per 100g (21+ nutrients)
   - Seasonal availability
   - Price estimates
   - Medical contraindications (JSONB)
   - Cultural significance (JSONB)
   - Dietary flags (halal, vegetarian, etc)

9. **food_alternatives** - Substitute options
   - Alternative ingredients
   - Substitution ratios
   - Medical/cultural reasons

#### **Chat & Conversation**

10. **conversations** - Chat sessions
    - User context
    - Topic categorization
    - Link to current meal plan

11. **chat_messages** - Message history
    - User/assistant messages
    - LLM metadata (model, tokens)
    - Structured data (JSONB)

#### **Analytics**

12. **meal_plan_feedback** - User feedback
    - Ratings (1-5)
    - Adherence scores
    - Qualitative feedback

13. **kpi_metrics** - System KPIs
    - Adherence rates
    - AKG compliance
    - Local food usage

### Key Design Decisions

#### **UUID as Primary Key**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```
- **Why?** Better for distributed systems, no collision risk
- **PostgreSQL native:** `gen_random_uuid()` built-in function

#### **JSONB for Flexible Data**
```typescript
contraindications: Json  // [{condition, reason, severity}]
culturalSignificance: Json  // [{culture, usages}]
```
- **Why?** Medical data & cultural context are complex and variable
- **Benefits:** Queryable with PostgreSQL JSONB operators

#### **Decimal for Nutrition Values**
```sql
calories DECIMAL(10,2)
proteinG DECIMAL(10,2)
```
- **Why?** Precise calculations, no floating-point errors
- **Use case:** Critical for medical nutrition calculations

#### **Cascading Deletes**
```prisma
onDelete: Cascade
```
- **Why?** Automatic cleanup when parent records deleted
- **Example:** Delete user → all meal plans & conversations deleted

---

## 🌐 API Architecture

### RESTful API Design

```
Base URL: https://api.nutrify.app/api/v1
```

### API Endpoint Structure

#### **Authentication** (`/auth`)

```http
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
PATCH  /api/v1/auth/profile
```

**Example: Register User**
```json
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "Ahmad Fauzi",
  "dateOfBirth": "1990-05-15",
  "gender": "M",
  "heightCm": 170,
  "currentWeightKg": 75,
  "culture": "Jawa",
  "medicalConditions": ["Hipertensi"],
  "activityLevel": "moderate"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1..."
  }
}
```

#### **Chat** (`/chat`)

```http
POST   /api/v1/chat/message
GET    /api/v1/chat/conversations
GET    /api/v1/chat/conversations/:id
DELETE /api/v1/chat/conversations/:id
```

**Example: Send Chat Message**
```json
POST /api/v1/chat/message
Authorization: Bearer <accessToken>
{
  "message": "Apa makanan yang bagus untuk penderita hipertensi?",
  "conversationId": "uuid-optional"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "message": "Untuk penderita hipertensi, saya rekomendasikan...",
    "conversationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### **Meal Plans** (`/meal-plans`)

```http
GET    /api/v1/meal-plans
POST   /api/v1/meal-plans/generate
GET    /api/v1/meal-plans/:id
DELETE /api/v1/meal-plans/:id
POST   /api/v1/meal-plans/:id/feedback
```

**Example: Generate Meal Plan**
```json
POST /api/v1/meal-plans/generate
Authorization: Bearer <accessToken>
{
  "duration": "7_days",
  "calorieTarget": 1800,
  "budget": 50000,
  "preferences": {
    "avoidSpicy": false,
    "preferredCuisine": "Jawa"
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "mealPlan": {
      "id": "uuid",
      "duration": "7_days",
      "avgCalories": 1820,
      "akgCompliance": 95,
      "localFoodPercentage": 72,
      "days": [ ... ]
    }
  }
}
```

### API Response Format

#### **Success Response**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-02T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

#### **Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-02T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Database/Redis down |

---

## 🤖 AI/LLM Integration

### Google Gemini AI Architecture

```
┌────────────────────────────────────────────────────────┐
│              LLM Service Layer (llmService.ts)         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  generateMealPlan()  │  │  chatWithGemini()    │   │
│  │                      │  │                      │   │
│  │  • Build prompt      │  │  • System context    │   │
│  │  • Call Gemini API   │  │  • Conversation hist │   │
│  │  • Parse JSON resp   │  │  • Multi-turn chat   │   │
│  └──────────────────────┘  └──────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│         Google Generative AI SDK (v0.24)              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Model: gemini-1.5-flash                              │
│  • Free tier: 15 requests/minute                      │
│  • Context window: 1M tokens                          │
│  • Structured output: JSON mode                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Meal Plan Generation Flow

```typescript
// 1. User request
const request = {
  userId: "uuid",
  culture: "Jawa",
  medicalConditions: ["Hipertensi", "Diabetes"],
  calorieTarget: 1800,
  duration: "7_days"
}

// 2. Build system prompt
const systemPrompt = `
You are Nutrify, an expert AI Dietician for Indonesia.

User Profile:
- Culture: Jawa
- Medical: Hipertensi, Diabetes  
- Calories: 1800 kcal/day

Requirements:
1. Use 60%+ local Indonesian foods
2. Comply with AKG guidelines
3. LOW SODIUM (<2000mg) - Hipertensi
4. LOW SUGAR (<50g) - Diabetes
5. Return VALID JSON only
`

// 3. Call Gemini API
const result = await model.generateContent(systemPrompt)

// 4. Parse response
const mealPlan = JSON.parse(result.response.text())

// 5. Validate with NutritionEngine
const engine = new NutritionEngine(user)
const compliance = engine.validateMealPlan(mealPlan)

// 6. Save to database
await prisma.mealPlan.create({ data: mealPlan })
```

### Prompt Engineering Strategy

#### **Meal Plan Prompt Structure**
```
[ROLE] → You are Nutrify, expert AI Dietician
[CONTEXT] → User profile, medical conditions, preferences
[CONSTRAINTS] → AKG limits, budget, cultural requirements
[FORMAT] → JSON schema specification
[EXAMPLES] → Sample meal plans (few-shot learning)
[TASK] → Generate meal plan for N days
```

#### **System Instructions**
```typescript
const systemInstruction = {
  role: "Nutrify AI Dietician",
  expertise: [
    "AKG (Angka Kecukupan Gizi) Indonesia",
    "Local Indonesian cuisine (Jawa, Sunda, Minang, etc)",
    "Medical nutrition therapy",
    "Cultural & religious dietary laws"
  ],
  rules: [
    "NEVER recommend foods that worsen medical conditions",
    "Prioritize local, affordable ingredients",
    "Always provide educational context",
    "Respond in simple Indonesian language"
  ]
}
```

### LLM Output Validation

```typescript
// Step 1: Parse JSON
const response = await gemini.generateContent(prompt)
const json = JSON.parse(response.text())

// Step 2: Schema validation (Zod)
const MealPlanSchema = z.object({
  breakfast: z.object({
    name: z.string(),
    calories: z.number().min(300).max(600),
    proteinG: z.number(),
    sodiumMg: z.number().max(700) // For hypertension
  }),
  // ... lunch, dinner
})

const validated = MealPlanSchema.parse(json)

// Step 3: Medical safety check
const engine = new NutritionEngine(user)
const safety = engine.validateMeal(validated.breakfast)

if (!safety.isCompliant) {
  throw new Error("Meal fails medical safety check")
}
```

---

## 🔒 Security Architecture

### Authentication Flow (JWT)

```
┌─────────────┐                ┌─────────────┐
│   Client    │                │   Server    │
└─────────────┘                └─────────────┘
       │                              │
       │  POST /auth/login            │
       │  { email, password }         │
       │─────────────────────────────>│
       │                              │
       │                              │ 1. Validate credentials
       │                              │ 2. Hash password (bcrypt)
       │                              │ 3. Compare hash
       │                              │
       │  { accessToken, refreshToken }│
       │<─────────────────────────────│
       │                              │
       │  Subsequent requests         │
       │  Authorization: Bearer <JWT> │
       │─────────────────────────────>│
       │                              │
       │                              │ 1. Verify JWT signature
       │                              │ 2. Check expiration
       │                              │ 3. Extract user ID
       │                              │
       │  Response                    │
       │<─────────────────────────────│
```

### JWT Token Structure

```typescript
// Access Token (15 minutes)
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1701518400,
  "exp": 1701519300,
  "type": "access"
}

// Refresh Token (7 days)
{
  "sub": "user-uuid",
  "iat": 1701518400,
  "exp": 1702123200,
  "type": "refresh"
}
```

### Security Measures

#### **1. Password Security**
```typescript
// Hashing with bcrypt (10 rounds)
const hash = await bcrypt.hash(password, 10)

// Validation
const isValid = await bcrypt.compare(inputPassword, storedHash)
```

#### **2. Rate Limiting**
```typescript
// 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
})
```

#### **3. CORS Policy**
```typescript
cors({
  origin: ['https://nutrify.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
})
```

#### **4. Helmet Security Headers**
```typescript
helmet({
  contentSecurityPolicy: true,
  xssFilter: true,
  noSniff: true,
  ieNoOpen: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
})
```

#### **5. Input Validation (Zod)**
```typescript
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  heightCm: z.number().min(100).max(250),
  currentWeightKg: z.number().min(30).max(300)
})

// Auto-validation
const data = RegisterSchema.parse(req.body)
```

#### **6. SQL Injection Prevention**
- ✅ **Prisma ORM** - Parameterized queries only
- ✅ **No raw SQL** without sanitization
- ✅ **UUID instead of sequential IDs**

---

## 🚀 Deployment Architecture

### Production Infrastructure

```
┌──────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐         ┌────────────────┐          │
│  │   Cloudflare   │         │   Google DNS   │          │
│  │   (DNS + CDN)  │         │                │          │
│  └────────┬───────┘         └────────────────┘          │
│           │                                              │
│           ▼                                              │
│  ┌────────────────────────────────────────┐             │
│  │         HTTPS Load Balancer            │             │
│  │         (SSL/TLS Termination)          │             │
│  └────────────────────────────────────────┘             │
│           │                      │                       │
│           ▼                      ▼                       │
│  ┌────────────────┐    ┌────────────────┐              │
│  │   Frontend     │    │    Backend     │              │
│  │   (Vercel)     │    │   (Railway)    │              │
│  │   Next.js SSR  │    │   Node.js API  │              │
│  │   Edge Network │    │   Containers   │              │
│  └────────────────┘    └────────┬───────┘              │
│                                  │                       │
│                                  ▼                       │
│                         ┌────────────────┐              │
│                         │   Supabase     │              │
│                         │   PostgreSQL   │              │
│                         │   (Managed DB) │              │
│                         └────────────────┘              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Deployment Options

#### **Option A: Recommended (Free Tier)**

| Component | Platform | Cost | Specs |
|-----------|----------|------|-------|
| **Frontend** | Vercel | FREE | 100GB bandwidth, Edge network |
| **Backend** | Railway | FREE | 500 hours/month, 512MB RAM |
| **Database** | Supabase | FREE | 500MB storage, 2GB bandwidth |
| **Redis** | Upstash | FREE | 10K commands/day |

**Total Cost:** $0/month 🎉

#### **Option B: Production (Paid)**

| Component | Platform | Cost | Specs |
|-----------|----------|------|-------|
| **Frontend** | Vercel Pro | $20/mo | Unlimited bandwidth |
| **Backend** | Railway Pro | $5/mo | 8GB RAM, 100GB storage |
| **Database** | Supabase Pro | $25/mo | 8GB storage, 250GB bandwidth |
| **Redis** | Upstash | $10/mo | 1M commands/day |

**Total Cost:** $60/month

### Environment Variables

#### **Backend (.env)**
```bash
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@host:5432/nutrify

# Redis
REDIS_URL=redis://default:pass@host:6379

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Gemini AI
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-1.5-flash

# CORS
ALLOWED_ORIGINS=https://nutrify.app,https://www.nutrify.app
```

#### **Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=https://api.nutrify.app
NEXT_PUBLIC_APP_URL=https://nutrify.app
NEXT_PUBLIC_ENVIRONMENT=production
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test
      - name: Build
        run: cd backend && npm run build
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## 📊 Data Flow Diagrams

### Meal Plan Generation Flow

```
┌───────────┐
│   User    │
└─────┬─────┘
      │
      │ 1. Request meal plan
      │    - Duration: 7 days
      │    - Calories: 1800
      ▼
┌─────────────────┐
│  Frontend (UI)  │
└────────┬────────┘
         │
         │ 2. POST /api/v1/meal-plans/generate
         │    Authorization: Bearer <token>
         ▼
┌──────────────────────┐
│  Backend Controller  │
│  mealPlanController  │
└──────────┬───────────┘
           │
           │ 3. Validate request (Zod)
           │ 4. Fetch user profile
           ▼
┌──────────────────────┐
│   Nutrition Engine   │
│   (AKG Calculator)   │
└──────────┬───────────┘
           │
           │ 5. Calculate requirements
           │    - BMI, daily calories
           │    - Macro split (P/C/F)
           │    - Medical constraints
           ▼
┌──────────────────────┐
│    LLM Service       │
│   (Gemini AI)        │
└──────────┬───────────┘
           │
           │ 6. Generate meal plan
           │    - Build prompt
           │    - Call Gemini API
           │    - Parse JSON response
           ▼
┌──────────────────────┐
│   Validation Layer   │
└──────────┬───────────┘
           │
           │ 7. Validate output
           │    - Schema check
           │    - Medical safety
           │    - AKG compliance
           ▼
┌──────────────────────┐
│   Database (Prisma)  │
│   meal_plans table   │
└──────────┬───────────┘
           │
           │ 8. Save meal plan
           │    - Create days & meals
           │    - Calculate scores
           ▼
┌──────────────────────┐
│  Response to Client  │
│  { mealPlan, days }  │
└──────────────────────┘
```

### Chat Conversation Flow

```
User: "Apa makanan yang bagus untuk hipertensi?"
  │
  ▼
┌────────────────────────┐
│  Frontend Chat UI      │
└───────────┬────────────┘
            │
            │ POST /api/v1/chat/message
            ▼
┌────────────────────────┐
│  Chat Controller       │
└───────────┬────────────┘
            │
            │ 1. Get/Create conversation
            ▼
┌────────────────────────┐
│  Conversation Service  │
└───────────┬────────────┘
            │
            │ 2. Build context
            │    - User medical history
            │    - Current meal plan
            │    - Previous messages
            ▼
┌────────────────────────┐
│  LLM Service (Gemini)  │
└───────────┬────────────┘
            │
            │ 3. Generate response
            │    System: "You are Nutrify..."
            │    Context: { medicalConditions: [...] }
            │    History: [...]
            ▼
┌────────────────────────┐
│  Save Messages         │
│  (User + Assistant)    │
└───────────┬────────────┘
            │
            ▼
AI: "Untuk penderita hipertensi, saya rekomendasikan:
     1. Sayuran hijau (bayam, kangkung) - Tinggi potassium
     2. Ikan tenggiri - Omega-3 untuk jantung
     3. Buah pisang - Potassium tinggi, sodium rendah
     
     Hindari: Garam berlebih, ikan asin, makanan kaleng"
```

---

## ⚡ Performance & Scalability

### Performance Optimizations

#### **1. Database Query Optimization**
```typescript
// ❌ N+1 Query Problem
const mealPlans = await prisma.mealPlan.findMany()
for (const plan of mealPlans) {
  const days = await prisma.mealPlanDay.findMany({ 
    where: { mealPlanId: plan.id } 
  })
}

// ✅ Use include (JOIN)
const mealPlans = await prisma.mealPlan.findMany({
  include: {
    days: {
      include: {
        meals: {
          include: { meal: true }
        }
      }
    }
  }
})
```

#### **2. Redis Caching**
```typescript
// Cache user profile (1 hour)
const cacheKey = `user:${userId}`
const cached = await redis.get(cacheKey)

if (cached) {
  return JSON.parse(cached)
}

const user = await prisma.user.findUnique({ where: { id: userId } })
await redis.setex(cacheKey, 3600, JSON.stringify(user))

return user
```

#### **3. Response Compression**
```typescript
import compression from 'compression'

app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024 // Only compress responses > 1KB
}))
```

#### **4. Database Connection Pooling**
```typescript
// Prisma connection pool
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Connection pool settings
  connection_limit = 10
  pool_timeout = 20
}
```

### Scalability Strategy

#### **Horizontal Scaling**
```
┌─────────────────────────────────────────────┐
│         Load Balancer (Nginx)               │
│         (Round-robin distribution)          │
└────────────┬────────────────────────────────┘
             │
      ┌──────┴──────┬──────────┬──────────┐
      ▼             ▼          ▼          ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ...
│ Node.js  │  │ Node.js  │  │ Node.js  │
│ Instance │  │ Instance │  │ Instance │
│    #1    │  │    #2    │  │    #3    │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │
     └─────────────┴──────────────┘
                   │
                   ▼
           ┌──────────────┐
           │  PostgreSQL  │
           │  (Replicas)  │
           └──────────────┘
```

#### **Caching Layers**
```
Client Request
     │
     ▼
┌─────────────────┐
│  CDN Cache      │  ← Static assets (images, CSS, JS)
│  (Cloudflare)   │     TTL: 1 year
└────────┬────────┘
         │ Cache MISS
         ▼
┌─────────────────┐
│  Redis Cache    │  ← API responses, user sessions
│  (In-memory)    │     TTL: 1 hour
└────────┬────────┘
         │ Cache MISS
         ▼
┌─────────────────┐
│  Database       │  ← Source of truth
│  (PostgreSQL)   │
└─────────────────┘
```

### Monitoring & Observability

```typescript
// Winston Logger - Structured logging
logger.info('Meal plan generated', {
  userId: user.id,
  duration: '7_days',
  avgCalories: 1820,
  processingTime: 2.3, // seconds
  llmTokens: 1523
})

// Metrics to track
const metrics = {
  // Performance
  apiResponseTime: 'p50, p95, p99',
  databaseQueryTime: 'avg, max',
  llmGenerationTime: 'avg, max',
  
  // Business
  mealPlansGenerated: 'count per day',
  chatMessages: 'count per day',
  userRegistrations: 'count per day',
  
  // Health
  errorRate: 'percentage',
  databaseConnections: 'active count',
  memoryUsage: 'MB',
  cpuUsage: 'percentage'
}
```

---

## 📖 Appendix

### System Requirements

**Development:**
- Node.js v20+
- PostgreSQL 15+ (or Supabase account)
- Redis 7+ (optional)
- 4GB RAM minimum
- 10GB disk space

**Production:**
- 2 CPU cores
- 2GB RAM
- 20GB SSD
- 100GB bandwidth/month

### API Rate Limits

| Tier | Requests/min | Requests/day |
|------|--------------|--------------|
| **Free** | 60 | 1,000 |
| **Basic** | 300 | 10,000 |
| **Pro** | 1,000 | 100,000 |

### Data Retention Policy

| Data Type | Retention Period |
|-----------|------------------|
| User profiles | Account lifetime |
| Meal plans | 1 year |
| Chat history | 90 days |
| Biomarker records | 2 years |
| System logs | 30 days |

---

## 🤝 Contributing & Contact

**Developer:** Achmad Roychan  
**Institution:** UNISSULA  
**Project:** Nutrify - AI Dietician for Indonesia  
**Repository:** https://github.com/Arroychaan/Nutrify-app  

**License:** MIT  

---

**Last Updated:** December 2, 2025  
**Document Version:** 1.0.0  
**Architecture Status:** ✅ Production Ready
