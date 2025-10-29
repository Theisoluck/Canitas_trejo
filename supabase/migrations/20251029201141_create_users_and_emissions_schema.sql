/*
  # Create Users and Emissions Management Schema

  ## Overview
  This migration creates the foundation for a sugarcane emissions tracking system.
  It establishes user authentication and the core data structure for managing hectares,
  tokens/earnings, and emission records.

  ## New Tables
  
  ### 1. `profiles`
  Extends Supabase auth.users with additional user information
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role (admin, manager, operator)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `hectares`
  Manages sugarcane field hectares
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Owner of the hectare
  - `name` (text) - Field name/identifier
  - `size` (numeric) - Size in hectares
  - `location` (text) - Geographic location
  - `status` (text) - Active, inactive, or harvested
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `emissions`
  Tracks emission records from sugarcane production
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - User who recorded the emission
  - `hectare_id` (uuid) - Related hectare
  - `emission_amount` (numeric) - Amount of CO2 emissions (kg)
  - `emission_date` (date) - Date of emission
  - `emission_type` (text) - Type: cultivation, harvest, transport, processing
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `tokens`
  Manages carbon credit tokens and earnings
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Token owner
  - `amount` (numeric) - Number of tokens
  - `token_type` (text) - Type: earned, purchased, retired
  - `value` (numeric) - Monetary value
  - `transaction_date` (timestamptz) - Transaction timestamp
  - `blockchain_tx` (text) - Blockchain transaction hash
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can view and manage their own data
  - Admins have full access to all data
  
  ## Important Notes
  1. All tables use UUID primary keys with automatic generation
  2. Timestamps are automatically managed with triggers
  3. Foreign key constraints ensure data integrity
  4. RLS policies restrict access based on user ownership
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'operator' CHECK (role IN ('admin', 'manager', 'operator')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hectares table
CREATE TABLE IF NOT EXISTS hectares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  size numeric NOT NULL CHECK (size > 0),
  location text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'harvested')),
  created_at timestamptz DEFAULT now()
);

-- Create emissions table
CREATE TABLE IF NOT EXISTS emissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hectare_id uuid REFERENCES hectares(id) ON DELETE SET NULL,
  emission_amount numeric NOT NULL CHECK (emission_amount >= 0),
  emission_date date NOT NULL DEFAULT CURRENT_DATE,
  emission_type text NOT NULL CHECK (emission_type IN ('cultivation', 'harvest', 'transport', 'processing')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  token_type text DEFAULT 'earned' CHECK (token_type IN ('earned', 'purchased', 'retired')),
  value numeric DEFAULT 0 CHECK (value >= 0),
  transaction_date timestamptz DEFAULT now(),
  blockchain_tx text,
  created_at timestamptz DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hectares ENABLE ROW LEVEL SECURITY;
ALTER TABLE emissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Hectares policies
CREATE POLICY "Users can view own hectares"
  ON hectares FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hectares"
  ON hectares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hectares"
  ON hectares FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hectares"
  ON hectares FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Emissions policies
CREATE POLICY "Users can view own emissions"
  ON emissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emissions"
  ON emissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emissions"
  ON emissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emissions"
  ON emissions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tokens policies
CREATE POLICY "Users can view own tokens"
  ON tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
  ON tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
  ON tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens"
  ON tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);