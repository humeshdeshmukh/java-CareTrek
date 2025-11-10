// Server Configuration
export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Supabase Configuration
export const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Table Names
export const TABLES = {
  APPOINTMENTS: 'appointments',
  USERS: 'users',
};
