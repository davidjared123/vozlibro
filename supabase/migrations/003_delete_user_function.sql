-- Create a function to delete a user (requires service role key)
-- This function will be called from the API route
CREATE OR REPLACE FUNCTION delete_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete the user from auth.users
    DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user(uuid) TO authenticated;
