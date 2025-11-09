import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../services/supabase';
import { setUser, setLoading, setError } from '../store/authSlice';
import { AppUser, UserRole } from '../store/authSlice';
import { mapSupabaseUserToAppUser } from '../utils/userMapper';

interface AuthContextType {
  user: AppUser | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [appState, setAppState] = useState<AppStateStatus>('active');

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => {
      subscription.remove();
    };
  }, []);

  // Handle auth state changes
  useEffect(() => {
    // Only set up the listener when the app is in the foreground
    if (appState === 'active') {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: { user } } = await supabase.auth.getUser();
          const role = (user?.user_metadata?.role as UserRole) || 'senior';
          
          dispatch(setUser(mapSupabaseUserToAppUser(user)));
        } else {
          dispatch(setUser(null));
        }
        dispatch(setLoading(false));
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, [appState, dispatch]);

  const login = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      dispatch(setError(error.message || 'Login failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      dispatch(setLoading(true));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: 'senior' // Default role
          }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      dispatch(setError(error.message || 'Registration failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      dispatch(setLoading(true));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      dispatch(setError(error.message || 'Logout failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const value = {
    user: useSelector((state: any) => state.auth.user),
    role: useSelector((state: any) => state.auth.role),
    isLoading: useSelector((state: any) => state.auth.loading),
    error: useSelector((state: any) => state.auth.error),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};