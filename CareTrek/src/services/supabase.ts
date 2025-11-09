import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, User } from '@supabase/supabase-js';
import Constants from 'expo-constants';
// Avoid importing profileService here to prevent a require-cycle (profileService imports supabase)

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'senior' | 'family';
  phone?: string;
  created_at?: string;
}

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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
