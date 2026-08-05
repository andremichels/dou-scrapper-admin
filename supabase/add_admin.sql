-- Run this in Supabase SQL Editor to add an admin user
-- First, get the user_id from auth.users (register via Editalis or Supabase Auth)
-- Then run:

-- INSERT INTO admin_users (user_id, role) 
-- VALUES ('<user-uuid-from-auth.users>', 'admin');

-- Example:
-- INSERT INTO admin_users (user_id, role) 
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'admin');
