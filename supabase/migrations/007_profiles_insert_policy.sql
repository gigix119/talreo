-- Talreo: allow users to insert own profile (fallback when trigger doesn't run)
-- Run if onboarding fails with "Cannot coerce" or RLS errors

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
