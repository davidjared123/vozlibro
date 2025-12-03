-- VozLibro Authentication Migration
-- This migration adds user authentication support to the books table

-- Step 1: Add user_id column to books table
ALTER TABLE books ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Step 2: Create index for performance
CREATE INDEX idx_books_user_id ON books(user_id);

-- Step 3: Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies

-- Policy: Users can only view their own books
CREATE POLICY "Users can view own books"
  ON books FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own books
CREATE POLICY "Users can insert own books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own books
CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own books
CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  USING (auth.uid() = user_id);

-- Note: Run this migration in your Supabase SQL Editor
-- After running, you'll need to manually update existing books to assign them to a user
-- or delete test data before enabling authentication
