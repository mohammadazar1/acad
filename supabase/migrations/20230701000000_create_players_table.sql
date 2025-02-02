-- Create players table
CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  sport TEXT NOT NULL,
  academy_id UUID NOT NULL REFERENCES academies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  payments JSONB DEFAULT '[]',
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policy for select
CREATE POLICY select_players ON players
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM academy_users WHERE academy_id = players.academy_id
  ));

-- Create policy for insert
CREATE POLICY insert_players ON players
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM academy_users WHERE academy_id = players.academy_id
  ));

-- Create policy for update
CREATE POLICY update_players ON players
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM academy_users WHERE academy_id = players.academy_id
  ));

-- Create policy for delete
CREATE POLICY delete_players ON players
  FOR DELETE USING (auth.uid() IN (
    SELECT user_id FROM academy_users WHERE academy_id = players.academy_id
  ));

-- Create trigger for updating the updated_at column
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

