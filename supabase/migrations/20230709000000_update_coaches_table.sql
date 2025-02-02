-- Add email and password fields to coaches table
ALTER TABLE public.coaches
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password TEXT;

-- Update existing rows in the users table
UPDATE public.users
SET role = 'ACADEMY'
WHERE role IS NULL OR role NOT IN ('ADMIN', 'ACADEMY', 'COACH');

-- Update the role column in users table to include COACH role
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'ACADEMY', 'COACH'));

-- Create a new table for coach sessions
CREATE TABLE IF NOT EXISTS public.coach_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id),
  session_token TEXT NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable Row Level Security on coach_sessions
ALTER TABLE public.coach_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for coach_sessions
CREATE POLICY coach_sessions_policy ON public.coach_sessions
FOR ALL USING (auth.uid() IN (
  SELECT c.id FROM coaches c
  WHERE c.id = coach_sessions.coach_id
));

