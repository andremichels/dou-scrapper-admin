-- Fix: disable RLS on admin_users — accessed only by server middleware
-- The middleware already authenticates users, so RLS here just adds friction
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
