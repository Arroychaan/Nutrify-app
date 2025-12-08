# 🚀 Deployment Guide - Nutrify

## Overview
- **Frontend (Next.js)**: Deploy ke **Vercel**
- **Backend (Express)**: Deploy ke **Railway** 
- **Database (PostgreSQL)**: Gunakan **Supabase** atau **Railway PostgreSQL**

---

## 📦 Step 1: Setup Database (Supabase - FREE)

1. Buka https://supabase.com dan buat akun
2. Create new project
3. Copy **Connection String** dari Settings → Database:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
4. Simpan URL ini untuk backend

---

## 🔧 Step 2: Deploy Backend ke Railway

### Option A: Deploy via GitHub (Recommended)

1. Push code ke GitHub repository
2. Buka https://railway.app dan login dengan GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Pilih repository, lalu pilih folder `backend`
5. Railway akan auto-detect Node.js

### Option B: Deploy via CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd backend

# Initialize & deploy
railway init
railway up
```

### Environment Variables di Railway

Setelah deploy, set environment variables di Railway dashboard:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | `postgresql://...` (dari Supabase) |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `REFRESH_TOKEN_SECRET` | Generate: `openssl rand -base64 32` |
| `GEMINI_API_KEY` | Dari https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | `gemini-2.0-flash` |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |

### Run Database Migrations

Setelah set DATABASE_URL, jalankan migration:

```bash
# Di Railway CLI atau tambahkan sebagai deploy command
npx prisma migrate deploy
```

---

## 🌐 Step 3: Deploy Frontend ke Vercel

### Via Vercel Dashboard (Recommended)

1. Buka https://vercel.com dan login dengan GitHub
2. Click **"Add New"** → **"Project"**
3. Import repository GitHub kamu
4. **PENTING**: Set **Root Directory** ke `frontend`
5. Framework akan auto-detect sebagai Next.js
6. Add Environment Variable:
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` |
7. Click **Deploy**

### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow prompts, set:
# - Link to existing project? No
# - Project name: nutrify-frontend
# - Directory: ./
# - Override settings? No
```

---

## 🔗 Step 4: Connect Frontend & Backend

Setelah backend deployed di Railway:

1. Copy Railway URL (contoh: `https://nutrify-backend-production.up.railway.app`)
2. Di Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` dengan Railway URL
3. Redeploy frontend di Vercel

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend.railway.app/health`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Register new user works
- [ ] Login works
- [ ] Chat AI responds (requires valid GEMINI_API_KEY)
- [ ] Meal plan generation works

---

## 🔧 Troubleshooting

### Error: CORS
Update `ALLOWED_ORIGINS` di Railway dengan frontend URL yang benar.

### Error: Database connection
- Pastikan `DATABASE_URL` benar
- Jalankan `npx prisma migrate deploy`

### Error: 500 on chat
- Cek `GEMINI_API_KEY` valid
- Cek `GEMINI_MODEL` = `gemini-2.0-flash`

### Error: 401 Unauthorized
- Token expired, login ulang
- Cek `JWT_SECRET` sama antara build

---

## 💰 Cost Estimate

| Service | Free Tier |
|---------|-----------|
| Vercel | ✅ Free (Hobby) |
| Railway | ✅ $5/month credit (cukup untuk small apps) |
| Supabase | ✅ Free (500MB database) |
| Gemini AI | ✅ Free tier available |

**Total: $0/month** untuk small apps!

---

## 🔐 Generate Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate REFRESH_TOKEN_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📱 Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records

### Railway
1. Go to Service Settings → Networking → Custom Domain
2. Add your domain
3. Update DNS records
