import { AppUser } from '../store/authSlice';
import { User } from '@supabase/supabase-js';

// Map a Supabase `User` (or null) to the AppUser shape used in the app.
// Return `null` when the input is falsy.
export const mapSupabaseUserToAppUser = (u: User | null): AppUser | null => {
  if (!u) return null;

  return {
    id: u.id,
    email: u.email ?? '',
    role: (u.user_metadata?.role as unknown as string) || 'senior',
    full_name: (u.user_metadata as any)?.full_name ?? '',
    user_metadata: (u.user_metadata as any) ?? {},
  } as AppUser;
};
