-- Create coach_salaries table
CREATE TABLE public.coach_salaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add salary field to coaches table
ALTER TABLE public.coaches
ADD COLUMN salary DECIMAL(10, 2);

-- Enable Row Level Security
ALTER TABLE public.coach_salaries ENABLE ROW LEVEL SECURITY;

-- Create policy for select
CREATE POLICY select_coach_salaries ON public.coach_salaries
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM users WHERE academyId = (
      SELECT academyId FROM coaches WHERE id = coach_salaries.coach_id
    )
  )
);

-- Create policy for insert
CREATE POLICY insert_coach_salaries ON public.coach_salaries
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users WHERE academyId = (
      SELECT academyId FROM coaches WHERE id = coach_salaries.coach_id
    )
  )
);

-- Create policy for update
CREATE POLICY update_coach_salaries ON public.coach_salaries
FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM users WHERE academyId = (
      SELECT academyId FROM coaches WHERE id = coach_salaries.coach_id
    )
  )
);

-- Create policy for delete
CREATE POLICY delete_coach_salaries ON public.coach_salaries
FOR DELETE USING (
  auth.uid() IN (
    SELECT id FROM users WHERE academyId = (
      SELECT academyId FROM coaches WHERE id = coach_salaries.coach_id
    )
  )
);

-- Create trigger for updating the updated_at column
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.coach_salaries
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

