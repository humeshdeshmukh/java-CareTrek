import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'senior' | 'family';
  phone?: string;
  created_at?: string;
}

export const createUserProfile = async (userId: string, userData: {
  full_name: string;
  role: 'senior' | 'family';
  phone?: string;
}): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ 
      id: userId,
      full_name: userData.full_name,
      role: userData.role,
      phone: userData.phone
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }

  return data as UserProfile;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error('Error fetching profile:', error);
    throw error;
  }

  return data as UserProfile;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data as UserProfile;
};
