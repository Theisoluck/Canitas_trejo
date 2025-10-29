import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://rrzdvtbyajznyefdtvpd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyemR2dGJ5YWp6bnllZmR0dnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTk4MDEsImV4cCI6MjA3NzMzNTgwMX0.Nx5tLqdS7WYE8LaDm42sWdW-5kiRWY6KctYPhAI2czE';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'operator';
  created_at: string;
  updated_at: string;
};

export type Hectare = {
  id: string;
  user_id: string;
  name: string;
  size: number;
  location: string | null;
  status: 'active' | 'inactive' | 'harvested';
  created_at: string;
};

export type Emission = {
  id: string;
  user_id: string;
  hectare_id: string | null;
  emission_amount: number;
  emission_date: string;
  emission_type: 'cultivation' | 'harvest' | 'transport' | 'processing';
  notes: string | null;
  created_at: string;
};

export type Token = {
  id: string;
  user_id: string;
  amount: number;
  token_type: 'earned' | 'purchased' | 'retired';
  value: number;
  transaction_date: string;
  blockchain_tx: string | null;
  created_at: string;
};
