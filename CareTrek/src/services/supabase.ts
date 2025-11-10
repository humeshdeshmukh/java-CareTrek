import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, User } from '@supabase/supabase-js';

// Supabase configuration - using direct values for now
const supabaseUrl = 'https://pankmvkykwcnxtaacasv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbmttdmt5a3djbnh0YWFjYXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDkxNjYsImV4cCI6MjA3ODI4NTE2Nn0.d--cEyPm0XbeU7thro6cLn-UXp48v86XtBaFH9lDqKE';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Test the connection
supabase
  .from('medications')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection test failed:', error.message);
    } else {
      console.log('Successfully connected to Supabase!');
    }
  });

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'senior' | 'family';
  phone?: string;
  created_at?: string;
}

interface SignUpParams {
  email: string;
  password: string;
  full_name: string;
  role: 'senior' | 'family';
  phone?: string;
}

export const signUp = async ({ email, password, full_name, role, phone }: SignUpParams) => {
  try {
    // Validate required fields
    const missingFields = [];
    if (!email?.trim()) missingFields.push('email');
    if (!password?.trim()) missingFields.push('password');
    if (!full_name?.trim()) missingFields.push('full_name');
    if (!role) missingFields.push('role');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const userEmail = email.trim().toLowerCase();
    const userName = full_name.trim();
    const userPhone = phone?.trim();

    console.log('Attempting to sign up with:', { 
      email: userEmail,
      hasPassword: true,
      full_name: userName,
      role,
      phone: userPhone
    });
    
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password: password.trim(),
      options: {
        data: {
          full_name: userName,
          role,
          phone: userPhone || ''
        },
        emailRedirectTo: 'caretrek://login',
      },
    });

    if (error) {
      console.error('Auth error:', error);
      throw error;
    }

    // 2. If user was created, the trigger should handle profile creation
    if (data.user) {
      console.log('Auth user created, waiting for profile creation...');
      
      // Give it a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify profile was created
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error verifying profile creation:', profileError);
        throw new Error('User created but profile verification failed');
      }
      
      console.log('Profile verified:', profileData);
    }

    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const getUserWithProfile = async (): Promise<{
  user: User | null;
  profile: UserProfile | null;
} | null> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Query the profiles table directly here to avoid importing profileService and creating a require cycle
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile in getUserWithProfile:', profileError);
    return { user, profile: null };
  }

  return { user, profile: profileData as UserProfile };
};
