# 📦 Setup & Installation Guide

Panduan lengkap untuk setup project Nutrify dari awal sampai jalan.

## 📋 Prerequisites

Sebelum mulai, pastikan lo udah install:

### 1. Node.js (WAJIB)
```bash
# Download dari: https://nodejs.org/
# Pilih LTS version (20.x atau lebih baru)

# Cek instalasi
node --version   # harus 20.x atau lebih
npm --version    # harus 9.x atau lebih
```

### 2. Git (WAJIB)
```bash
# Download dari: https://git-scm.com/

# Cek instalasi
git --version
```

### 3. PostgreSQL (OPSIONAL - untuk fitur lengkap)

**Option A: Supabase (RECOMMENDED - GRATIS & MUDAH!)**
```bash
# 1. Daftar di https://supabase.com (gratis!)
# 2. Create new project
# 3. Copy connection string dari Settings > Database
# 4. Paste ke .env:
#    DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
```

**Option B: Docker (Local)**
```bash
docker run --name nutrify-postgres \
  -e POSTGRES_PASSWORD=nutrify123 \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Install Langsung**
```bash
# Download dari: https://www.postgresql.org/download/
```

### 4. Redis (OPSIONAL - untuk caching)
```bash
# Option A: Install langsung (Windows)
# Download dari: https://github.com/microsoftarchive/redis/releases

# Option B: Pakai Docker (recommended)
docker run --name nutrify-redis \
  -p 6379:6379 \
  -d redis:7
```

### 5. Code Editor (RECOMMENDED)
- **VS Code** - https://code.visualstudio.com/
- Extensions yang disarankan:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Prisma

---

## 🚀 Quick Installation (Tanpa Database)

Kalau cuma mau test server API tanpa database:

```bash
# 1. Masuk ke folder backend
cd nutrify/backend

# 2. Install dependencies
npm install

# 3. Jalankan server
npm run dev
```

✅ **DONE!** Server jalan di http://localhost:3001

**Catatan:** Server bisa jalan tanpa PostgreSQL/Redis di development mode.

---

## 🔧 Full Installation (Dengan Database)

### Step 1: Clone/Extract Project

```bash
# Kalau dari Git
git clone <repository-url>
cd nutrify

# Kalau dari ZIP
# Extract zip file
cd nutrify
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

Output yang normal:
```
added 569 packages, and audited 569 packages in 15s
87 packages are looking for funding
found 0 vulnerabilities
```

### Step 3: Setup Environment Variables

```bash
# Copy .env.example ke .env
cp .env.example .env

# Atau di Windows:
copy .env.example .env
```

Edit file `.env`:

```bash
# Server
NODE_ENV=development
PORT=3001

# Database (sesuaikan dengan setup PostgreSQL lo)
# Option A: Supabase (recommended)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Option B: Docker Local
# DATABASE_URL=postgresql://postgres:nutrify123@localhost:5432/nutrify_dev

# Redis (sesuaikan dengan setup Redis lo)
REDIS_URL=redis://localhost:6379

# JWT Secret (ganti di production!)
JWT_SECRET=your_super_secret_jwt_key_here
REFRESH_TOKEN_SECRET=your_refresh_secret_key_here

# Gemini AI (dapetin gratis dari Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### Step 4: Setup PostgreSQL Database

**Option A: Supabase (RECOMMENDED - Gratis & Mudah!)**

```bash
# 1. Buka https://supabase.com dan login/daftar
# 2. Klik "New Project"
# 3. Isi form:
#    - Name: nutrify
#    - Database Password: buat password yang kuat (SIMPAN INI!)
#    - Region: Southeast Asia (Singapore)
# 4. Tunggu ~2 menit sampai project ready
# 5. Klik Settings (icon gear) > Database
# 6. Scroll ke bawah, cari "Connection string" > URI
# 7. Copy connection string, contoh:
#    postgresql://postgres.xxxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
# 8. Paste ke file .env di folder backend

DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Option B: Docker (Local)**

```bash
docker run --name nutrify-postgres \
  -e POSTGRES_PASSWORD=nutrify123 \
  -e POSTGRES_DB=nutrify_dev \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Install PostgreSQL Langsung**

```bash
# Download dari https://www.postgresql.org/download/
# Install, lalu buat database:
psql -U postgres
CREATE DATABASE nutrify_dev;
\q
```

### Step 5: Generate Prisma Client

```bash
npx prisma generate
```

Output yang benar:
```
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 388ms
```

### Step 6: Run Database Migrations

```bash
npx prisma migrate dev
```

Ini akan:
- Buat tabel di database
- Apply semua migrations
- Generate Prisma Client lagi

### Step 7: Seed Database (Opsional)

```bash
npx prisma db seed
```

Ini akan mengisi database dengan data sample:
- 100+ makanan lokal Indonesia
- User sample
- Meal plan sample

### Step 8: Run Development Server

```bash
npm run dev
```

Output yang benar:
```
[INFO]: Starting Nutrify Backend in development mode
[INFO]: Database connection successful
[INFO]: Redis initialized successfully
[INFO]: Server is running on http://localhost:3001
```

### Step 9: Test Server

Buka browser atau Postman:

```
GET http://localhost:3001/api/v1/health
```

Response yang benar:
```json
{
  "status": "OK",
  "timestamp": "2025-11-12T20:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

---

## � Supabase Setup (Detail)

Supabase adalah PostgreSQL cloud yang gratis dan gampang banget dipake. Perfect untuk development & production!

### Kenapa Supabase?

- ✅ **GRATIS** - 500MB database, 2GB bandwidth/bulan
- ✅ **Ga perlu install apapun** - Tinggal daftar dan pakai
- ✅ **Auto backup** - Database lo otomatis di-backup
- ✅ **Fast** - Server di Singapore (latency rendah)
- ✅ **Dashboard** - Bisa liat data langsung di browser

### Step-by-Step Setup Supabase

**1. Daftar Akun**

- Buka https://supabase.com
- Klik "Start your project"
- Sign up pakai GitHub atau Email

**2. Create New Project**

- Klik "New Project"
- Isi form:
  - **Organization:** Pilih atau buat baru
  - **Name:** `nutrify` (atau nama lo suka)
  - **Database Password:** Buat password KUAT (SIMPAN INI! Lo butuh nanti)
    - Contoh: `Nutrify2025!Secure`
  - **Region:** Pilih **Southeast Asia (Singapore)** biar cepet
  - **Pricing Plan:** Free tier (udah cukup)
- Klik "Create new project"
- Tunggu ~2 menit (bikin coffee dulu ☕)

**3. Ambil Connection String**

Setelah project ready:

- Klik icon **Settings** (gear icon di sidebar)
- Pilih **Database**
- Scroll ke bawah, cari section **"Connection string"**
- Pilih tab **"URI"**
- Klik **Copy** (ada icon copy)

Connection string akan kaya gini:
```
postgresql://postgres.abcdefghijklmnop:YOUR-PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**PENTING:** Ganti `YOUR-PASSWORD` dengan password yang lo buat tadi!

**4. Update .env File**

Edit file `.env` di folder `backend/`:

```bash
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:Nutrify2025!Secure@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**5. Test Connection**

```bash
cd backend
npx prisma db push
```

Kalau sukses, lo akan liat:
```
✔ Your database is now in sync with your Prisma schema.
```

**6. Run Migrations & Seed**

```bash
npx prisma migrate dev
npx prisma db seed
```

**7. Explore Database (Opsional)**

Di Supabase dashboard:
- Klik **Table Editor** di sidebar
- Lo bisa liat semua tabel yang dibuat Prisma
- Bisa edit data langsung dari browser!

### Troubleshooting Supabase

**Error: "Authentication failed"**
- Cek password di connection string udah bener
- Password ga boleh ada spasi atau karakter aneh yang ga di-encode

**Error: "Connection timeout"**
- Cek internet lo
- Cek region: harus Southeast Asia biar cepet

**Error: "Too many connections"**
- Free tier limit: 60 concurrent connections
- Restart server lo: `npm run dev`

---

## �🔑 Gemini AI Setup

### Dapetin API Key (GRATIS!)

1. Buka: https://aistudio.google.com/app/apikey
2. Login dengan akun Google
3. Klik "Create API Key"
4. Copy API key yang muncul

### Set API Key

Edit file `.env`:

```bash
GEMINI_API_KEY=AIzaSyAbc123DefGhi456JklMno789PqrStu012
```

### Test Gemini AI

API endpoints yang pakai Gemini:
- `POST /api/v1/meal-plans/generate` - Generate meal plan
- `POST /api/v1/chat/message` - Chat dengan AI dietician

---

## 🐳 Docker Setup (Alternative)

Kalau mau semua jalan di Docker:

```bash
# Build dan run semua services
docker-compose up -d

# Cek logs
docker-compose logs -f

# Stop semua
docker-compose down
```

File `docker-compose.yml` udah include:
- PostgreSQL
- Redis
- Backend API

---

## 🧪 Testing Setup

### Test Manual (Postman/Thunder Client)

1. Import collection dari `docs/postman_collection.json` (coming soon)
2. Test endpoints:
   - Health check
   - Auth (register, login)
   - Chat
   - Meal plans

### Test dengan curl

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

---

## 🐛 Troubleshooting

### 1. npm install error

**Error:** `EACCES: permission denied`

**Solusi:**
```bash
# Linux/Mac
sudo npm install -g npm

# Windows: Run terminal as Administrator
```

### 2. Port 3001 sudah dipakai

**Error:** `EADDRINUSE: address already in use :::3001`

**Solusi:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### 3. PostgreSQL/Supabase connection failed

**Error:** `Authentication failed against database server`

**Solusi untuk Supabase:**
- ✅ Cek password di `.env` udah bener (replace `YOUR-PASSWORD`)
- ✅ Cek connection string lengkap (dari `postgresql://` sampai `/postgres`)
- ✅ Pastikan project Supabase udah "Active" (bukan "Paused")
- ✅ Test connection: `npx prisma db push`

**Solusi untuk Docker/Local:**
- Cek PostgreSQL jalan: `docker ps` atau `pg_isready`
- Cek credentials di `.env` sama dengan setup PostgreSQL
- Cek port 5432 ga diblock firewall

### 4. Prisma generate failed

**Error:** `Prisma Client did not initialize yet`

**Solusi:**
```bash
npx prisma generate
npm run dev
```

### 5. TypeScript compile error

**Error:** `Cannot find module '@config/index.js'`

**Solusi:**
```bash
# Install tsconfig-paths (already installed)
npm run build

# Kalau masih error, cek tsconfig.json paths
```

### 6. Gemini API error

**Error:** `GEMINI_API_KEY is not configured`

**Solusi:**
- Ambil API key dari https://aistudio.google.com/app/apikey
- Set di `.env`: `GEMINI_API_KEY=your_key_here`
- Restart server: `npm run dev`

---

## 📝 Next Steps

Setelah setup berhasil:

1. ✅ Test semua API endpoints
2. ✅ Baca API documentation di README.md
3. ✅ Implement controller logic (sekarang masih stub)
4. ✅ Build frontend (React)
5. ✅ Deploy ke production

---

## 💡 Development Tips

### Auto-reload aktif
Setiap edit file, server otomatis restart (thanks to `tsx watch`).

### Logging
Semua request tercatat di console. Format di development: text, di production: JSON.

### Database Explorer
Pakai Prisma Studio untuk explore database:
```bash
npx prisma studio
```
Buka: http://localhost:5555

### API Testing
Pakai VS Code extension **Thunder Client** atau **REST Client**.

---

## 📧 Need Help?

Kalau stuck atau ada error:

1. Cek section Troubleshooting di atas
2. Cek logs di terminal
3. Google error message nya
4. Contact developer

---

Last Updated: November 2025
