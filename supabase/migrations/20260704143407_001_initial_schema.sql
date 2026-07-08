/*
# Initial Schema for On-Demand Service Application

1. Purpose
   - Creates the core database schema for an on-demand service platform
   - Supports three user roles: Customer, Provider, Admin
   - Handles services, categories, bookings, and availability

2. New Tables
   - `profiles` - Extended user data linked to auth.users
   - `categories` - Service categories (e.g., Cleaning, Plumbing)
   - `services` - Individual services offered by providers
   - `bookings` - Customer booking requests
   - `provider_availability` - Provider's available time slots
   - `reviews` - Customer reviews for completed bookings

3. Security
   - RLS enabled on all tables
   - Owner-scoped policies for customers and providers
   - Admin has full access via service role
   - Provider can only manage their own services and bookings
   - Customers can only see their own bookings

4. Important Notes
   - user_id columns default to auth.uid() for automatic ownership
   - Provider profiles have a verification status
   - Bookings track full lifecycle: pending -> accepted/rejected -> completed/cancelled
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin')),
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon_url text,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
  address text NOT NULL,
  notes text,
  total_amount decimal(10,2) NOT NULL,
  cancellation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Provider availability table
CREATE TABLE IF NOT EXISTS provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_availability_provider ON provider_availability(provider_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow insert on signup (triggered by auth)
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "admin_read_profiles" ON profiles;
CREATE POLICY "admin_read_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update any profile
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Customers can view provider profiles (for booking)
DROP POLICY IF EXISTS "customer_view_providers" ON profiles;
CREATE POLICY "customer_view_providers" ON profiles FOR SELECT
  TO authenticated USING (
    role = 'provider' OR auth.uid() = id
  );

-- ============================================
-- CATEGORIES POLICIES (Public read, Admin write)
-- ============================================

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_categories" ON categories;
CREATE POLICY "admin_manage_categories" ON categories FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- SERVICES POLICIES
-- ============================================

-- Everyone can read active services
DROP POLICY IF EXISTS "read_active_services" ON services;
CREATE POLICY "read_active_services" ON services FOR SELECT
  TO authenticated USING (is_active = true OR auth.uid() = provider_id);

-- Providers can create their own services
DROP POLICY IF EXISTS "provider_insert_services" ON services;
CREATE POLICY "provider_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = provider_id);

-- Providers can update their own services
DROP POLICY IF EXISTS "provider_update_services" ON services;
CREATE POLICY "provider_update_services" ON services FOR UPDATE
  TO authenticated USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- Providers can delete their own services
DROP POLICY IF EXISTS "provider_delete_services" ON services;
CREATE POLICY "provider_delete_services" ON services FOR DELETE
  TO authenticated USING (auth.uid() = provider_id);

-- Admins can manage all services
DROP POLICY IF EXISTS "admin_manage_services" ON services;
CREATE POLICY "admin_manage_services" ON services FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- BOOKINGS POLICIES
-- ============================================

-- Customers can read their own bookings
DROP POLICY IF EXISTS "customer_read_bookings" ON bookings;
CREATE POLICY "customer_read_bookings" ON bookings FOR SELECT
  TO authenticated USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- Customers can create bookings
DROP POLICY IF EXISTS "customer_insert_bookings" ON bookings;
CREATE POLICY "customer_insert_bookings" ON bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

-- Provider can update bookings they are assigned to
DROP POLICY IF EXISTS "provider_update_bookings" ON bookings;
CREATE POLICY "provider_update_bookings" ON bookings FOR UPDATE
  TO authenticated USING (auth.uid() = provider_id OR auth.uid() = customer_id)
  WITH CHECK (auth.uid() = provider_id OR auth.uid() = customer_id);

-- Customers can cancel their own bookings
DROP POLICY IF EXISTS "customer_delete_bookings" ON bookings;
CREATE POLICY "customer_delete_bookings" ON bookings FOR DELETE
  TO authenticated USING (auth.uid() = customer_id);

-- Admins can manage all bookings
DROP POLICY IF EXISTS "admin_manage_bookings" ON bookings;
CREATE POLICY "admin_manage_bookings" ON bookings FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- PROVIDER AVAILABILITY POLICIES
-- ============================================

-- Anyone can read provider availability
DROP POLICY IF EXISTS "read_provider_availability" ON provider_availability;
CREATE POLICY "read_provider_availability" ON provider_availability FOR SELECT
  TO authenticated USING (true);

-- Providers manage their own availability
DROP POLICY IF EXISTS "provider_insert_availability" ON provider_availability;
CREATE POLICY "provider_insert_availability" ON provider_availability FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = provider_id);

DROP POLICY IF EXISTS "provider_update_availability" ON provider_availability;
CREATE POLICY "provider_update_availability" ON provider_availability FOR UPDATE
  TO authenticated USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

DROP POLICY IF EXISTS "provider_delete_availability" ON provider_availability;
CREATE POLICY "provider_delete_availability" ON provider_availability FOR DELETE
  TO authenticated USING (auth.uid() = provider_id);

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Everyone can read reviews
DROP POLICY IF EXISTS "read_reviews" ON reviews;
CREATE POLICY "read_reviews" ON reviews FOR SELECT
  TO authenticated USING (true);

-- Customers can create reviews for their bookings
DROP POLICY IF EXISTS "customer_insert_reviews" ON reviews;
CREATE POLICY "customer_insert_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

-- Function to update timestamp on update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description, sort_order) VALUES
  ('Home Cleaning', 'Professional home cleaning services', 1),
  ('Plumbing', 'Pipe repair, installation, and maintenance', 2),
  ('Electrical', 'Electrical repairs and installations', 3),
  ('Beauty & Wellness', 'Salon and spa services at home', 4),
  ('Appliance Repair', 'Repair for home appliances', 5),
  ('Painting', 'Interior and exterior painting services', 6),
  ('AC Services', 'Air conditioning repair and maintenance', 7),
  ('Pest Control', 'Professional pest management', 8)
ON CONFLICT (name) DO NOTHING;
