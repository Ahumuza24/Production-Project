# FundiBots Database Setup

## Quick Fix for Login Error

The 406 error occurs because the `profiles` table doesn't exist in your Supabase database yet. Here's how to fix it:

### Option 1: Run SQL in Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to your project**: `mrzluuxlfuuayzahmszc`
3. **Go to SQL Editor** (left sidebar)
4. **Copy and paste** the entire content from `supabase/migrations/001_initial_schema.sql`
5. **Click "Run"** to execute the SQL

### Option 2: Use Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not done already)
supabase init

# Link to your project
supabase link --project-ref mrzluuxlfuuayzahmszc

# Run the migration
supabase db push
```

## What This Sets Up

The migration creates:

- ✅ **profiles** table - User profiles with roles (project_lead/assembler)
- ✅ **projects** table - Manufacturing projects
- ✅ **components** table - Project components
- ✅ **processes** table - Manufacturing processes (CNC, Assembly, etc.)
- ✅ **work_sessions** table - Time tracking for work
- ✅ **Row Level Security** - Proper access control
- ✅ **Triggers** - Auto-create profiles on user signup
- ✅ **Default data** - Pre-populated processes

## Test the Fix

After running the SQL:

1. **Try logging in again** - The 406 error should be gone
2. **Sign up a new user** - Profile will be auto-created
3. **Check the profiles table** - Should see user data with roles

## Default Test Users

You can create test users with different roles by signing up and then updating their role in the profiles table:

```sql
-- Make a user a project lead
UPDATE profiles 
SET role = 'project_lead' 
WHERE email = 'your-email@example.com';
```

## Troubleshooting

If you still get errors:

1. **Check RLS policies** - Make sure they're enabled
2. **Verify table creation** - Check if all tables exist
3. **Check user permissions** - Ensure your API key has proper access
4. **Clear browser cache** - Sometimes helps with auth issues

The app should work perfectly after running this migration!