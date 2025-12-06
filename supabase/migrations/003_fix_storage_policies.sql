-- Fix storage policies for profile-images bucket to resolve RLS errors
-- Run this in your Supabase SQL Editor

BEGIN;

-- Drop existing policies to clean up potential conflicts
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy 1: Public Read Access (Anyone can view images)
CREATE POLICY "Public Read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Policy 2: Authenticated Upload Access
-- Allows any authenticated user to upload files to the profile-images bucket
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Policy 3: Owner Update Access
-- Allows users to update only their own files
CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images' AND owner = auth.uid());

-- Policy 4: Owner Delete Access
-- Allows users to delete only their own files
CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images' AND owner = auth.uid());

COMMIT;
