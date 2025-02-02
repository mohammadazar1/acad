-- Add player_number column to players table
ALTER TABLE public.players
ADD COLUMN player_number VARCHAR(20);

-- Add a unique constraint to ensure player numbers are unique within an academy
ALTER TABLE public.players
ADD CONSTRAINT unique_player_number_per_academy UNIQUE (academyId, player_number);

