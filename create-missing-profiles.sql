-- Simple script to create profiles for users that don't have them
-- Run this in Supabase SQL Editor

-- Create profiles for all users that don't have them
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'name', 
    split_part(u.email, '@', 1)
  ) as name,
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'project_lead' THEN 'project_lead'::user_role
    ELSE 'assembler'::user_role
  END as role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Check the results
SELECT 
  p.id,
  p.email,
  p.name,
  p.role,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;