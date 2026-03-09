-- Enable RLS on feedback table.
-- Users can insert their own feedback and read only their own.
-- Admin reads all feedback via service role (bypasses RLS).

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users insert own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read only their own feedback
CREATE POLICY "Users read own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
