# 🚀 Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: ALITO Access Management
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Wait for project to be created (~2 minutes)

## Step 2: Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Project Reference ID**: Found in URL or Configuration

3. Update `backend/.env`:
```bash
SUPABASE_URL=<YOUR_PROJECT_URL>
SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
ENABLE_SUPABASE_SYNC=true
```

## Step 3: Link Project with CLI

```bash
cd "c:\Users\wilbe\Downloads\APP HERRAMIENTAS"
npx supabase link --project-ref <YOUR_PROJECT_REF>
```

It will ask for your database password.

## Step 4: Push Migrations

```bash
npx supabase db push
```

This will create all tables in Supabase.

## Step 5: Verify

1. Go to **Table Editor** in Supabase Dashboard
2. You should see 3 tables:
   - `employees`
   - `states`
   - `requests`

## Step 6: Test Sync

1. Start your server:
```bash
cd backend
npm start
```

2. Open http://localhost:3000
3. Create/edit an employee
4. Check Supabase Dashboard → Table Editor → employees
5. You should see the data synced! ✅

---

## Troubleshooting

**Error: "Tables already exist"**
- Safe to ignore if tables were created manually
- Run: `npx supabase db reset` to start fresh (⚠️ deletes all data)

**Error: "Connection failed"**
- Check `.env` credentials
- Verify project is active in dashboard

**Sync not working**
- Ensure `ENABLE_SUPABASE_SYNC=true` in `.env`
- Check server logs for sync errors

---

## Useful Commands

```bash
# Check migration status
npx supabase db diff

# Create new migration
npx supabase migration new <migration_name>

# Reset database (⚠️ deletes all data)
npx supabase db reset

# Start local Supabase (for development)
npx supabase start
```
