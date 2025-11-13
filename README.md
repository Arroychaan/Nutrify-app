# 🥗 Nutrify - AI Dietician untuk Indonesia

Nutrify adalah aplikasi AI Dietician yang dirancang khusus untuk masyarakat Indonesia. Aplikasi ini memberikan rekomendasi meal plan personal berdasarkan kondisi medis, budaya, dan preferensi makanan lokal.

## ✨ Fitur Utama

- 🤖 **AI Chatbot** - Chat dengan AI dietician untuk konsultasi gizi
- 🍽️ **Meal Plan Personal** - Rekomendasi menu harian sesuai kebutuhan kalori & kondisi kesehatan
- 🇮🇩 **Makanan Lokal** - 60%+ menggunakan bahan makanan lokal Indonesia
- 📊 **Biomarker Tracking** - Monitor gula darah, kolesterol, tekanan darah
- 🎯 **AKG Compliance** - Sesuai dengan Angka Kecukupan Gizi Indonesia
- 💰 **Budget Friendly** - Sesuaikan dengan budget harian

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- npm atau yarn
- (Opsional) Supabase account untuk database - **GRATIS!** ([Sign up](https://supabase.com))

### Instalasi & Jalankan Server

```bash
# 1. Clone atau extract project
cd nutrify/backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
# File .env sudah ada, tapi lo bisa edit kalau perlu
# Untuk development tanpa database, biarkan aja default

# 4. Jalankan development server
npm run dev
```

**Server akan jalan di:** http://localhost:3001

**Health Check:** http://localhost:3001/api/v1/health

### Setup Gemini AI (GRATIS!)

Untuk menggunakan fitur AI meal plan generator:

```bash
# 1. Dapetin API Key (FREE)
# Buka: https://aistudio.google.com/app/apikey
# Klik "Create API Key"
# Copy API key nya

# 2. Edit file .env di folder backend
GEMINI_API_KEY=masukkan_api_key_disini
```

### Setup Database (Opsional)

Kalau mau fitur lengkap dengan database:

**Option A: Supabase (RECOMMENDED - Gratis!)**

```bash
# 1. Daftar di https://supabase.com
# 2. Create New Project (pilih region Southeast Asia)
# 3. Copy connection string dari Settings > Database
# 4. Edit .env di folder backend:

DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# 5. Setup database
cd backend
npx prisma migrate dev
npx prisma db seed
```

**Option B: Docker (Local)**

```bash
# Jalankan PostgreSQL di Docker
docker run --name nutrify-postgres -e POSTGRES_PASSWORD=nutrify123 -p 5432:5432 -d postgres

# Setup database
cd backend
npx prisma migrate dev
npx prisma db seed
```

## 📁 Struktur Project

```
nutrify/
├── backend/                 # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/         # Konfigurasi (database, redis, logger)
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (LLM, dll)
│   │   ├── engines/        # Nutrition engine
│   │   ├── middlewares/    # Auth, error handling, logging
│   │   └── utils/          # Helper functions
│   ├── prisma/             # Database schema & seed
│   └── .env                # Environment variables
└── README.md               # ← You are here
```

## 🔧 Commands

```bash
# Development
npm run dev          # Jalankan server dengan auto-reload
npm run build        # Compile TypeScript ke JavaScript
npm start            # Jalankan production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Jalankan database migrations
npx prisma db seed   # Seed database dengan data sample

# Testing
npm test            # (coming soon)
```

## 🌐 API Endpoints

### Health Check
```
GET /api/v1/health
```

### Authentication
```
POST /api/v1/auth/register   # Register user baru
POST /api/v1/auth/login      # Login
POST /api/v1/auth/refresh    # Refresh access token
POST /api/v1/auth/logout     # Logout
```

### Chat
```
POST /api/v1/chat/message    # Chat dengan AI dietician
GET  /api/v1/chat/history    # History chat
```

### Meal Plans
```
GET  /api/v1/meal-plans              # List meal plans user
POST /api/v1/meal-plans/generate     # Generate meal plan baru
GET  /api/v1/meal-plans/:id          # Detail meal plan
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4
- **Language:** TypeScript 5 (Strict mode)
- **Database:** PostgreSQL 15 + Prisma ORM
- **Cache:** Redis 7
- **AI/LLM:** Google Gemini AI (gemini-1.5-flash)
- **Auth:** JWT + bcrypt
- **Logging:** Winston

### Deployment
- **Container:** Docker + Docker Compose
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx (optional)

## 🐛 Troubleshooting

### Server tidak bisa start?

```bash
# Cek port 3001 dipakai atau tidak
netstat -ano | findstr :3001

# Kill process di port 3001 (Windows)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

### Warning "Database not available"?

**Ini NORMAL!** Server bisa jalan tanpa database di development mode. Warning ini cuma info aja.

Kalau mau setup database (untuk fitur lengkap):
- **Recommended:** Setup Supabase (GRATIS & 5 menit aja!) → Lihat [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- **Alternative:** Pakai Docker local → Lihat [SETUP.md](SETUP.md)

### Error "GEMINI_API_KEY is not configured"?

Ambil API key gratis dari: https://aistudio.google.com/app/apikey

Trus set di file `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

## 📝 Environment Variables

File `.env` di folder `backend/`:

```bash
# Server
NODE_ENV=development
PORT=3001

# Database (opsional untuk development)
# Supabase (recommended - GRATIS!): https://supabase.com
DATABASE_URL=postgresql://postgres.[PROJECT]:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Redis (opsional untuk development)
REDIS_URL=redis://localhost:6379

# JWT Secret (ganti di production!)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Gemini AI
GEMINI_API_KEY=                    # Isi dengan API key dari Google AI Studio
GEMINI_MODEL=gemini-1.5-flash      # Model yang dipakai
```

## 🎯 Development Roadmap

- [x] Backend API (Node.js + Express + TypeScript)
- [x] Database Schema (Prisma)
- [x] Nutrition Logic Engine
- [x] LLM Integration (Gemini AI)
- [x] Authentication (JWT)
- [x] API Endpoints
- [ ] **Frontend Web (React)** ← Next!
- [ ] Mobile App (React Native)
- [ ] Deploy ke Production

## 💡 Tips Development

1. **Development tanpa DB:** Server bisa jalan normal tanpa PostgreSQL/Redis
2. **Auto-reload:** Setiap edit code, server otomatis restart
3. **Logging:** Semua request tercatat di console dengan Winston logger
4. **API Testing:** Pakai Postman atau Thunder Client extension di VS Code

## 📧 Kontak

**Developer:** Achmad Roychan  
**Institution:** UNISSULA  
**Project:** Nutrify - AI Dietician for Indonesia

---

**Status:** ✅ Backend Development Complete | 🚧 Frontend In Progress

Last Updated: November 2025
