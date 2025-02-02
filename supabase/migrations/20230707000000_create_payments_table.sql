-- Create payments table
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id),
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policy for select
CREATE POLICY select_payments ON public.payments
FOR SELECT USING (
  auth.uid() IN (
    SELECT users.id 
    FROM users 
    JOIN players ON users.academyId = players.academyId 
    WHERE players.id = payments.player_id
  )
);

-- Create policy for insert
CREATE POLICY insert_payments ON public.payments
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT users.id 
    FROM users 
    JOIN players ON users.academyId = players.academyId 
    WHERE players.id = payments.player_id
  )
);

-- Create policy for update
CREATE POLICY update_payments ON public.payments
FOR UPDATE USING (
  auth.uid() IN (
    SELECT users.id 
    FROM users 
    JOIN players ON users.academyId = players.academyId 
    WHERE players.id = payments.player_id
  )
);

-- Create policy for delete
CREATE POLICY delete_payments ON public.payments
FOR DELETE USING (
  auth.uid() IN (
    SELECT users.id 
    FROM users 
    JOIN players ON users.academyId = players.academyId 
    WHERE players.id = payments.player_id
  )
);

-- Create trigger for updating the updated_at column
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

