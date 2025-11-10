import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../services/supabase';
import { setUser, setLoading, setError } from '../store/authSlice';
import { AppUser, UserRole } from '../store/authSlice';
import { mapSupabaseUserToAppUser } from '../utils/userMapper';
import { storeAuthToken, removeAuthToken, getAuthToken } from '../utils';

interface AuthContextType {
  user: AppUser | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: any; session: any }>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AppUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [appState, setAppState] = useState<AppStateStatus>('active');
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => {
      subscription.remove();
    };
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch(setLoading(true));
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const role = (user.user_metadata?.role as UserRole) || 'senior';
          dispatch(setUser(mapSupabaseUserToAppUser(user)));
        }
      } catch (error: any) {
        console.error('Error initializing auth:', error);
        dispatch(setError(error.message || 'Failed to initialize authentication'));
      } finally {
        dispatch(setLoading(false));
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Handle auth state changes
  useEffect(() => {
    if (!isInitialized) return;
    
    // Only set up the listener when the app is in the foreground
    if (appState === 'active') {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const role = (user.user_metadata?.role as UserRole) || 'senior';
            dispatch(setUser(mapSupabaseUserToAppUser(user)));
          }
        } else {
          dispatch(setUser(null));
        }
        dispatch(setLoading(false));
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, [appState, dispatch, isInitialized]);

  const refreshUser = async (): Promise<AppUser | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = (user.user_metadata?.role as UserRole) || 'senior';
        const appUser = mapSupabaseUserToAppUser(user);
        dispatch(setUser(appUser));
        return appUser;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[Auth] Starting login process...');
      dispatch(setLoading(true));
      
      // Sign in with email and password
      console.log('[Auth] Signing in with email and password...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('[Auth] Login error:', error);
        throw error;
      }
      
      if (!data.user || !data.session) {
        console.error('[Auth] No user or session data found');
        throw new Error('No user or session data found');
      }
      
      console.log('[Auth] Login successful, storing access token...');
      // Store the access token
      await storeAuthToken(data.session.access_token);
      
      // Verify the token was stored
      const storedToken = await getAuthToken();
      console.log('[Auth] Token stored successfully:', storedToken ? 'Token exists' : 'No token found');
      
      // Map the user data and update the store
      const role = (data.user.user_metadata?.role as UserRole) || 'senior';
      const appUser = mapSupabaseUserToAppUser(data.user);
      console.log('[Auth] Dispatching setUser with:', appUser);
      dispatch(setUser(appUser));
      
      return { user: data.user, session: data.session };
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
      if (data.user) {
        await refreshUser();
      }
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
      await removeAuthToken(); // Clear the stored token
      if (error) throw error;
      dispatch(setUser(null));
    } catch (error: any) {
      dispatch(setError(error.message || 'Logout failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const { user, role, isLoading, error } = useSelector((state: any) => state.auth);

  const value = {
    user,
    role,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
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