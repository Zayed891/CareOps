# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account (free tier is perfect for this hackathon)
3. Click **"New Project"**
4. Fill in:
   - **Name**: CareOps (or any name you prefer)
   - **Database Password**: Create a strong password and **save it**
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free

## 2. Get Your Database Connection String

1. Once your project is created, go to **Project Settings** (gear icon in sidebar)
2. Navigate to **Database** section
3. Scroll down to **Connection string**
4. Select **Transaction** mode (required for Prisma)
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the database password you created

## 3. Update Your Backend `.env` File

1. Open `backend/.env`
2. Replace the `DATABASE_URL` value with your Supabase connection string:
   ```bash
   DATABASE_URL="postgresql://postgres.abcdefghijk:YourActualPassword@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
   ```

## 4. Run Your First Migration

Once your `.env` is configured, run:

```bash
cd backend
npx prisma migrate dev --name init
```

This will:
- Create all database tables from your Prisma schema
- Generate a migration file
- Update your Prisma client

## 5. Verify Connection

You can verify the connection in Supabase:
1. Go to **Table Editor** in Supabase dashboard
2. You should see all your tables created (User, Workspace, Contact, etc.)

## Optional: View Your Database

Supabase provides a nice UI to view and manage your data:
- **Table Editor**: Browse and edit data
- **SQL Editor**: Run custom queries
- **Database**: View table structure

---

## Troubleshooting

**Error: "Can't reach database server"**
- Check if your connection string is correct
- Ensure you replaced `[YOUR-PASSWORD]` with your actual password
- Verify your Supabase project is active

**Migration fails**
- Make sure you're using the **Transaction** mode connection string (port 5432)
- Not the **Session** mode (port 6543)

---

## What's Next?

After successful migration, you're ready to:
1. Start the backend server: `npm run dev`
2. Test registration/login flows
3. Continue with Phase 2 development!
