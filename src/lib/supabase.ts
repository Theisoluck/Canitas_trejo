import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
