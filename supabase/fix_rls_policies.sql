-- Run this in Supabase Dashboard → SQL Editor → New query
-- Replaces the FOR ALL policy (unreliable with PostgREST upsert) with explicit
-- SELECT / INSERT / UPDATE policies that PostgREST handles correctly.

-- 1. Inspect current state (review before running the rest)
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_preferences';

-- 2. Drop the catch-all policy
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;

-- 3. Explicit SELECT policy
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Explicit INSERT policy
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Explicit UPDATE policy  (USING checks the existing row, WITH CHECK checks the new row)
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Verify the result
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_preferences'
ORDER BY cmd;
