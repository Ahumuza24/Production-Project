-- Fix automatic profile creation at signup
-- Run this in Supabase SQL Editor

-- First, let's check if the trigger exists and drop it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a robust function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role user_role;
BEGIN
  -- Extract name from metadata or use email prefix
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract role from metadata or default to assembler
  user_role := CASE 
    WHEN NEW.raw_user_meta_data->>'role' = 'project_lead' THEN 'project_lead'::user_role
    ELSE 'assembler'::user_role
  END;
  
  -- Insert the profile
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, user_name, user_role);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test that the trigger was created successfully
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Also verify the function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

SELECT 'Automatic profile creation trigger installed successfully!' as status;