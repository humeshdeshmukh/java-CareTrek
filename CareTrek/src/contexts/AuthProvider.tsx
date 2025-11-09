import React, { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAppDispatch } from '../store';
import { setUser, setLoading } from '../store/authSlice';
import { mapSupabaseUserToAppUser } from '../utils/userMapper';
import { User } from '@supabase/supabase-js';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Set initial loading to true
    dispatch(setLoading(true));

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user) {
          dispatch(setUser(mapSupabaseUserToAppUser(session.user)));
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        if (session?.user) {
          dispatch(setUser(mapSupabaseUserToAppUser(session.user)));
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
