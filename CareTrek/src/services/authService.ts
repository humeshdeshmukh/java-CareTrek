import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import { storeAuthToken, removeAuthToken } from '../utils/auth';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Store the access token
    if (data.session?.access_token) {
      await storeAuthToken(data.session.access_token);
    }
    
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    await removeAuthToken(); // Clear any existing token on error
    return { user: null, session: null, error: error as Error };
  }
};

export const signUp = async (email: string, password: string, userData: any): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
        },
      },
    });

    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { user: null, session: null, error: error as Error };
  }
};

export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    await removeAuthToken(); // Clear the stored token
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    await removeAuthToken(); // Ensure token is cleared even if there's an error
    return { error: error as Error };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getSession = async (): Promise<{ session: Session | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error) {
    console.error('Error getting session:', error);
    return { session: null, error: error as Error };
  }
};
