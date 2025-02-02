-- Create coaches table
CREATE TABLE public.coaches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  phone_number TEXT,
  academyId UUID NOT NULL REFERENCES academies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

-- Create policy for select
CREATE POLICY select_coaches ON public.coaches
FOR SELECT USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = coaches.academyId
));

-- Create policy for insert
CREATE POLICY insert_coaches ON public.coaches
FOR INSERT WITH CHECK (auth.uid() IN (
  SELECT id FROM users WHERE academyId = coaches.academyId
));

-- Create policy for update
CREATE POLICY update_coaches ON public.coaches
FOR UPDATE USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = coaches.academyId
));

-- Create policy for delete
CREATE POLICY delete_coaches ON public.coaches
FOR DELETE USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = coaches.academyId
));

-- Create trigger for updating the updated_at column
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.coaches
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

