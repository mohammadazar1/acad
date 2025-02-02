-- Update policy for players table
CREATE OR REPLACE POLICY "Players are viewable by active academies" ON public.players
FOR SELECT USING (
  auth.uid() IN (
    SELECT users.id 
    FROM users 
    JOIN academies ON users.academyId = academies.id 
    WHERE academies.status = 'active'
  )
);

-- Similar policies for INSERT, UPDATE, and DELETE on players table

-- Update policy for expenses table
CREATE OR REPLACE POLICY "Expenses are viewable by active academies" ON public.expenses
FOR SELECT USING (
  auth.uid() IN (
    SELECT users.id 
    FROM users 
    JOIN academies ON users.academyId = academies.id 
    WHERE academies.status = 'active'
  )
);

-- Similar policies for INSERT, UPDATE, and DELETE on expenses table

-- Update policy for coaches table
CREATE OR REPLACE POLICY "Coaches are viewable by active academies" ON public.coaches
FOR SELECT USING (
  auth.uid() IN (
    SELECT users.id 
    FROM users 
    JOIN academies ON users.academyId = academies.id 
    WHERE academies.status = 'active'
  )
);

-- Similar policies for INSERT, UPDATE, and DELETE on coaches table

-- Update policy for attendance table
CREATE OR REPLACE POLICY "Attendance is viewable by active academies" ON public.attendance
FOR SELECT USING (
  auth.uid() IN (
    SELECT users.id 
    FROM users 
    JOIN academies ON users.academyId = academies.id 
    WHERE academies.status = 'active'
  )
);

-- Similar policies for INSERT, UPDATE, and DELETE on attendance table

