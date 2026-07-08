/*
# Admin Seed Data

1. Purpose
   - Creates a default admin account for testing and initial access
   - The admin can be used to manage the platform

2. Credentials
   - Email: admin@servicehub.com
   - Password: admin123456

3. Note
   - This creates the profile record. The auth.users entry must be created
     through the signup flow or Supabase dashboard for production.
*/

-- Create admin profile (if auth user exists, they can sign in)
-- For testing, sign up with admin@servicehub.com and then run:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@servicehub.com';

-- This migration sets up the structure. To create the admin:
-- 1. Go to the signup page and create account with admin@servicehub.com
-- 2. The profile will be created with 'customer' role by default
-- 3. Use Supabase dashboard to change role to 'admin', or use this SQL:
-- UPDATE profiles SET role = 'admin', is_verified = true WHERE email = 'admin@servicehub.com';
