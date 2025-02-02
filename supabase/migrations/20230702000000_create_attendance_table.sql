-- Create attendance table
CREATE TABLE public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  academyId UUID NOT NULL REFERENCES academies(id),
  player_id UUID NOT NULL REFERENCES players(id),
  date DATE NOT NULL,
  division TEXT NOT NULL,
  is_present BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint
ALTER TABLE public.attendance ADD CONSTRAINT unique_attendance UNIQUE (academyId, date, division, player_id);

-- Create index for faster queries
CREATE INDEX idx_attendance_academy_date ON public.attendance (academyId, date);

-- Enable Row Level Security
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policy for select
CREATE POLICY select_attendance ON public.attendance
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM users WHERE academyId = attendance.academyId
  ));

-- Create policy for insert
CREATE POLICY insert_attendance ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM users WHERE academyId = attendance.academyId
  ));

-- Create policy for update
CREATE POLICY update_attendance ON public.attendance
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM users WHERE academyId = attendance.academyId
  ));

-- Create policy for delete
CREATE POLICY delete_attendance ON public.attendance
  FOR DELETE USING (auth.uid() IN (
    SELECT id FROM users WHERE academyId = attendance.academyId
  ));

-- Create trigger for updating the updated_at column
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

