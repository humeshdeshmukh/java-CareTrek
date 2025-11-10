import { env } from './env';

// Server Configuration
export const PORT = parseInt(env.PORT, 10);
export const JWT_SECRET = env.JWT_SECRET;

// Supabase Configuration
export const SUPABASE_URL = env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

// Table Names
export const TABLES = {
  APPOINTMENTS: 'appointments',
  USERS: 'users',
};
