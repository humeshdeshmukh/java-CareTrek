import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
const result = config({ path: envPath });

if (result.error) {
  console.warn('Warning: Could not load .env file:', result.error);
}

// Export all environment variables
export const env = {
  PORT: process.env.PORT || '5000',
  JWT_SECRET: process.env.JWT_SECRET || 'your-default-jwt-secret',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
};
