-- Update the policy for selecting coach salaries
CREATE OR REPLACE POLICY "Coach salaries are viewable by their own academy" ON public.coach_salaries
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM coaches
    WHERE coaches.id = coach_salaries.coach_id
    AND coaches.academyId = auth.uid()
  )
);

-- Update the policy for inserting coach salaries
CREATE OR REPLACE POLICY "Users can insert coach salaries for their own academy" ON public.coach_salaries
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM coaches
    WHERE coaches.id = coach_salaries.coach_id
    AND coaches.academyId = auth.uid()
  )
);

-- Update the policy for updating coach salaries
CREATE OR REPLACE POLICY "Users can update coach salaries for their own academy" ON public.coach_salaries
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM coaches
    WHERE coaches.id = coach_salaries.coach_id
    AND coaches.academyId = auth.uid()
  )
);

-- Update the policy for deleting coach salaries
CREATE OR REPLACE POLICY "Users can delete coach salaries for their own academy" ON public.coach_salaries
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM coaches
    WHERE coaches.id = coach_salaries.coach_id
    AND coaches.academyId = auth.uid()
  )
);

