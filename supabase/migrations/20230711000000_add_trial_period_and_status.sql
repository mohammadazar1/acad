-- Add trial_end_date and status columns to academies table
ALTER TABLE public.academies
ADD COLUMN trial_end_date DATE,
ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'));

-- Update existing rows to set a default trial period (e.g., 30 days from creation date)
UPDATE public.academies
SET trial_end_date = created_at + INTERVAL '30 days'
WHERE trial_end_date IS NULL;

-- Make trial_end_date NOT NULL after setting default values
ALTER TABLE public.academies
ALTER COLUMN trial_end_date SET NOT NULL;

