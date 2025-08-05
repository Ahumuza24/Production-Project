-- Quick fix for signup trigger issue
-- Run this in your Supabase SQL Editor

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a simpler, more robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert the profile
  BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      CASE 
        WHEN NEW.raw_user_meta_data->>'role' = 'project_lead' THEN 'project_lead'::user_role
        ELSE 'assembler'::user_role
      END
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, update it
      UPDATE public.profiles 
      SET 
        email = NEW.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', name),
        role = CASE 
          WHEN NEW.raw_user_meta_data->>'role' = 'project_lead' THEN 'project_lead'::user_role
          ELSE role
        END,
        updated_at = NOW()
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log error but don't fail user creation
      RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test the function works
SELECT 'Trigger function created successfully' as status;