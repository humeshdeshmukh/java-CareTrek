import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// User roles
export type UserRole = 'senior' | 'family' | 'admin';

// Extended user type with role information
export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at?: string;
  user_metadata?: {
    full_name?: string;
    role?: UserRole;
    [key: string]: any;
  };
  [key: string]: any; // Allow additional properties
}

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  role: UserRole | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  role: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return rejectWithValue(error.message || 'Invalid email or password');
      }

      if (!data.user) {
        return rejectWithValue('User not found');
      }

      // Fetch user role from user_metadata
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role as UserRole || 'senior';

      return { user: data.user, role };
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || 'An error occurred during login');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { email, password, name }: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        return rejectWithValue(error.message);
      }

      return data.user;
    } catch (error) {
      return rejectWithValue('An error occurred during registration');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await supabase.auth.signOut();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Accept null when clearing user (e.g. logout or rehydrate)
    setUser: (state, action: PayloadAction<AppUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { user, role } = action.payload;
        state.loading = false;
        state.user = {
          id: user.id,
          email: user.email || '',
          role: role || 'senior',
          full_name: user.user_metadata?.full_name || '',
          user_metadata: user.user_metadata
        };
        state.role = role || 'senior';
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string || 'Login failed';
        state.user = null;
        state.role = null;
      });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      const user = action.payload;
      state.loading = false;
      if (!user) {
        state.error = 'Registration failed';
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        return;
      }

      state.user = {
        id: user.id || uuidv4(),
        email: user.email || '',
        role: 'senior', // Default role for new users
        full_name: user.user_metadata?.full_name || '',
        user_metadata: user.user_metadata
      };
      state.role = 'senior';
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setUser, setLoading, setError, clearError } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }): AppUser | null => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }): UserRole | null => state.auth.role;
export const selectIsLoading = (state: { auth: AuthState }): boolean => state.auth.loading;

export const selectIsSenior = createSelector(
  [selectUserRole],
  (role: UserRole | null): boolean => role === 'senior'
);

export const selectIsFamilyMember = createSelector(
  [selectUserRole],
  (role: UserRole | null): boolean => role === 'family'
);

export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role: UserRole | null): boolean => role === 'admin'
);

export default authSlice.reducer;
