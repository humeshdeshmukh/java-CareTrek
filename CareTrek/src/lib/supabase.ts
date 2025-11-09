import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase URL or Anon Key. Please check your environment variables.');
}

// Define user type
export type User = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: 'senior' | 'family';
    phone?: string;
  };
};

// Initialize the Supabase client with better configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-requested-with': 'com.caretrek.app',
    },
  },
});

// Add network status listener (guarded — some Supabase client builds may not
// expose `setReconnectTimeout`). We keep this defensive to avoid runtime
// errors on platforms or versions where the method is missing.
const handleNetworkStatus = () => {
  try {
    const realtimeAny = (supabase as any).realtime;
    if (realtimeAny && typeof realtimeAny.setReconnectTimeout === 'function') {
      realtimeAny.setReconnectTimeout(1000);
    } else {
      // Optional debug logging in development.
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('supabase.realtime.setReconnectTimeout not available — skipping');
      }
    }
  } catch (err) {
    // Avoid crashing the app because of missing realtime internals.
    // eslint-disable-next-line no-console
    console.warn('Could not set Supabase realtime reconnect timeout:', err);
  }
};

// Set up network status listener when the app starts
handleNetworkStatus();

// Function to handle email confirmation
export const handleEmailConfirmation = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (data?.session) {
      // User is already logged in
      return { user: data.session.user, error: null };
    }
    
    // Check if we have a session in the URL (email confirmation)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    return { user: session?.user || null, error: null };
  } catch (error) {
    console.error('Error handling email confirmation:', error);
    return { user: null, error };
  }
};

// Helper function to get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user as User | null;
};

// Helper function to sign up a new user
export const signUp = async (email: string, password: string, userData: { full_name: string; role: 'senior' | 'family'; phone?: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...userData,
      },
      emailRedirectTo: 'caretrek://login', // Custom URL scheme for deep linking
    },
  });

  if (error) throw error;
  return data;
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in with email:', email);
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (response.error) {
      console.error('Sign in error:', response.error);
      throw response.error;
    }
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    console.log('Sign in successful, user:', response.data.user?.email);
    return response;
  } catch (error) {
    console.error('Sign in exception:', error);
    throw error;
  }
};

export default supabase;
