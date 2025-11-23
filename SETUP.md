# UniTrack Pro - Setup Guide

This guide will help you set up the backend infrastructure for UniTrack Pro.

## Prerequisites

- A [Supabase](https://supabase.com) account (free tier is sufficient)
- Node.js 16+ installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: UniTrack Pro (or any name you prefer)
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize (this takes 1-2 minutes)

## Step 2: Set Up the Database

Once your project is ready, you need to create the tasks table.

1. In your Supabase project dashboard, click on the **SQL Editor** icon in the left sidebar
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create tasks table
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  course text not null,
  description text,
  type text not null,
  status text not null,
  priority text not null,
  due_date text not null,
  subtasks jsonb default '[]'::jsonb,
  created_at text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table tasks enable row level security;

-- Create policies
-- Users can only see their own tasks
create policy "Users can view their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

-- Users can insert their own tasks
create policy "Users can insert their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

-- Users can update their own tasks
create policy "Users can update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

-- Users can delete their own tasks
create policy "Users can delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index tasks_user_id_idx on tasks(user_id);
```

4. Click "Run" or press `Ctrl/Cmd + Enter`
5. You should see "Success. No rows returned" - this is expected!

## Step 3: Configure Authentication

Supabase authentication is already enabled by default, but let's verify the settings:

1. Click on the **Authentication** icon in the left sidebar
2. Go to **Settings** under Authentication
3. Ensure the following are configured:
   - **Enable email confirmations**: You can turn this OFF for development (recommended for testing)
   - **Secure email change**: Can be turned OFF for development
   - **Email templates**: Leave as default or customize

### For Development (Easier Testing):
1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, disable "Confirm email"
3. This allows immediate login without email verification

### For Production:
- Keep email confirmation enabled
- Users will receive an email to verify their account

## Step 4: Get Your API Credentials

1. Click on the **Settings** icon (gear icon) in the left sidebar
2. Go to **API** under Project Settings
3. You'll see two important values:
   - **Project URL**: Something like `https://xxxxx.supabase.co`
   - **anon public key**: A long JWT token starting with `eyJ...`

## Step 5: Configure Your App

1. In your UniTrack Pro project root, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Replace the values with your actual Project URL and anon key from Step 4

## Step 6: Install and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Step 7: Test Your Setup

1. Open the app in your browser (usually `http://localhost:5173`)
2. You should see the login/signup page
3. Create a test account:
   - Email: `test@example.com`
   - Password: `test123` (or any password with 6+ characters)
4. If email confirmation is disabled, you can log in immediately
5. If email confirmation is enabled, check your email for the confirmation link
6. Once logged in, try creating a task
7. Your tasks are now stored in Supabase and tied to your user account!

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure your `.env` file exists in the project root
- Check that the variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after creating/modifying `.env`

### Can't log in / Sign up not working
- Check your Supabase project is active (not paused)
- Verify your API credentials are correct
- Check browser console for specific error messages
- Ensure you ran the SQL setup correctly

### Tasks not showing up
- Make sure you're logged in
- Check that Row Level Security policies are set up correctly
- Verify the tasks table exists in Supabase Table Editor

### "User not authenticated" errors
- Your session may have expired - try logging out and back in
- Check that the Supabase client is properly initialized

## Security Notes

1. **Never commit your `.env` file** - it's already in `.gitignore`
2. The `anon` key is safe to use in your frontend - it's designed for that
3. Row Level Security (RLS) ensures users can only access their own data
4. For production, consider:
   - Enabling email confirmation
   - Setting up proper rate limiting
   - Adding password reset functionality
   - Implementing session timeout

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Add your environment variables in your hosting platform's settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Make sure your Supabase project is on an appropriate plan for your expected usage

3. Consider setting up a custom domain in Supabase for better branding

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check the browser console for error messages
