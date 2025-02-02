-- Create expenses table
CREATE TABLE public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    academyId UUID NOT NULL REFERENCES academies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for select
CREATE POLICY select_expenses ON public.expenses
FOR SELECT USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = expenses.academyId
));

-- Create policy for insert
CREATE POLICY insert_expenses ON public.expenses
FOR INSERT WITH CHECK (auth.uid() IN (
  SELECT id FROM users WHERE academyId = expenses.academyId
));

-- Create policy for update
CREATE POLICY update_expenses ON public.expenses
FOR UPDATE USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = expenses.academyId
));

-- Create policy for delete
CREATE POLICY delete_expenses ON public.expenses
FOR DELETE USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = expenses.academyId
));

-- Create trigger for updating the updated_at column
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

