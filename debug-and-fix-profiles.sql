-- Debug and fix profile creation issues
-- Run this in Supabase SQL Editor

-- 1. Check if the trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT 
  routine_name, 
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 3. Check existing users without profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data,
  p.id as profile_exists
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 4. Create profiles for existing users (run this if users exist without profiles)
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'project_lead' THEN 'project_lead'::user_role
    ELSE 'assembler'::user_role
  END as role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. Test the trigger function manually (replace with actual user data)
-- SELECT public.handle_new_user() -- This won't work directly, but we can test the logic

-- 6. Check RLS policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. Verify the profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Check if there are any constraint violations
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;