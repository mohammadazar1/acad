-- Create revenue_items table
CREATE TABLE public.revenue_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  costPrice DECIMAL(10, 2) NOT NULL,
  sellingPrice DECIMAL(10, 2) NOT NULL,
  profit DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  academyId UUID NOT NULL REFERENCES academies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.revenue_items ENABLE ROW LEVEL SECURITY;

-- Create policy for select
CREATE POLICY select_revenue_items ON public.revenue_items
FOR SELECT USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = revenue_items.academyId
));

-- Create policy for insert
CREATE POLICY insert_revenue_items ON public.revenue_items
FOR INSERT WITH CHECK (auth.uid() IN (
  SELECT id FROM users WHERE academyId = revenue_items.academyId
));

-- Create policy for update
CREATE POLICY update_revenue_items ON public.revenue_items
FOR UPDATE USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = revenue_items.academyId
));

-- Create policy for delete
CREATE POLICY delete_revenue_items ON public.revenue_items
FOR DELETE USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = revenue_items.academyId
));

-- Create trigger for updating the updated_at column
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.revenue_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

