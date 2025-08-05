-- Enable Row Level Security
-- Create custom types
CREATE TYPE user_role AS ENUM ('project_lead', 'assembler');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'paused');
CREATE TYPE work_status AS ENUM ('in_progress', 'completed', 'paused');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'assembler',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
  status project_status DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Components table
CREATE TABLE public.components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity_per_unit INTEGER NOT NULL CHECK (quantity_per_unit > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processes table
CREATE TABLE public.processes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work sessions table
CREATE TABLE public.work_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE,
  process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE,
  assembler_id UUID REFERENCES public.profiles(id),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  parts_completed INTEGER DEFAULT 0 CHECK (parts_completed >= 0),
  status work_status DEFAULT 'in_progress',
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN end_time IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60 
      ELSE NULL 
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress tracking view
CREATE VIEW public.project_progress AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.total_quantity,
  c.id as component_id,
  c.name as component_name,
  (c.quantity_per_unit * p.total_quantity) as total_needed,
  COALESCE(SUM(ws.parts_completed), 0) as completed_parts,
  ROUND(
    (COALESCE(SUM(ws.parts_completed), 0)::decimal / (c.quantity_per_unit * p.total_quantity)) * 100, 2
  ) as completion_percentage
FROM projects p
LEFT JOIN components c ON p.id = c.project_id
LEFT JOIN work_sessions ws ON c.id = ws.component_id AND ws.status = 'completed'
GROUP BY p.id, p.name, p.total_quantity, c.id, c.name, c.quantity_per_unit;

-- Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Project leads can manage projects" ON public.projects FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'project_lead'
  )
);
CREATE POLICY "Assemblers can view projects" ON public.projects FOR SELECT USING (true);

-- Components policies
CREATE POLICY "Project leads can manage components" ON public.components FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'project_lead'
  )
);
CREATE POLICY "Assemblers can view components" ON public.components FOR SELECT USING (true);

-- Processes policies (all users can view, only project leads can manage)
CREATE POLICY "All users can view processes" ON public.processes FOR SELECT USING (true);
CREATE POLICY "Project leads can manage processes" ON public.processes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'project_lead'
  )
);

-- Work sessions policies
CREATE POLICY "Users can view all work sessions" ON public.work_sessions FOR SELECT USING (true);
CREATE POLICY "Assemblers can manage own work sessions" ON public.work_sessions FOR ALL 
USING (auth.uid() = assembler_id);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'assembler')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default processes
INSERT INTO public.processes (name, description) VALUES
('CNC Cutting', 'Computer Numerical Control cutting process'),
('Post Processing', 'Sanding, vanishing and painting'),
('Laser Engraving', 'Laser engraving where applicable'),
('Assembly', 'Final assembly of components');

-- Function for project analytics
CREATE OR REPLACE FUNCTION get_project_analytics(project_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_components', COUNT(c.id),
    'completed_components', COUNT(CASE WHEN pg.completion_percentage = 100 THEN 1 END),
    'overall_progress', AVG(pg.completion_percentage),
    'active_assemblers', COUNT(DISTINCT ws.assembler_id),
    'total_hours', SUM(ws.duration_minutes) / 60.0
  ) INTO result
  FROM projects p
  LEFT JOIN components c ON p.id = c.project_id
  LEFT JOIN project_progress pg ON c.id = pg.component_id
  LEFT JOIN work_sessions ws ON c.id = ws.component_id
  WHERE p.id = project_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;