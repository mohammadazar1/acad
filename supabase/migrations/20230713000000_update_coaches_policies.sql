-- Update the policy for selecting coaches
CREATE OR REPLACE POLICY "Coaches are viewable by their own academy" ON public.coaches
FOR SELECT USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = coaches.academyId
));

-- Update the policy for inserting coaches
CREATE OR REPLACE POLICY "Users can insert coaches for their own academy" ON public.coaches
FOR INSERT WITH CHECK (auth.uid() IN (
  SELECT id FROM users WHERE academyId = coaches.academyId
));

-- Update the policy for updating coaches
CREATE OR REPLACE POLICY "Users can update coaches for their own academy" ON public.coaches
FOR UPDATE USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = coaches.academyId
));

-- Update the policy for deleting coaches
CREATE OR REPLACE POLICY "Users can delete coaches for their own academy" ON public.coaches
FOR DELETE USING (auth.uid() IN (
  SELECT id FROM users WHERE academyId = coaches.academyId
));

