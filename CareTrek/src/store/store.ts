import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer, 
  createMigrate, 
  createTransform,
  FLUSH, 
  REHYDRATE, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER 
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { Action, ThunkAction } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here
});

// Root state type
export type RootState = ReturnType<typeof rootReducer>;

// Migration to transform the state if needed
const migrations = {
  2: (state: any) => {
    console.log('Running migration to version 2', state);
    
    if (!state) {
      console.log('No state to migrate');
      return {};
    }
    
    const newState = { ...state };
    
    // Ensure auth state exists and has correct types
    if (newState.auth) {
      console.log('Migrating auth state:', newState.auth);
      
      // Ensure _persist is properly structured
      if (newState.auth._persist) {
        newState.auth._persist = {
          version: newState.auth._persist.version || 2,
          rehydrated: newState.auth._persist.rehydrated === true || 
                      newState.auth._persist.rehydrated === 'true',
        };
      }
      
      newState.auth = {
        user: newState.auth.user || null,
        isAuthenticated: newState.auth.isAuthenticated === true || 
                        newState.auth.isAuthenticated === 'true' || 
                        false,
        loading: newState.auth.loading === true || 
                newState.auth.loading === 'true' || 
                false,
        error: typeof newState.auth.error === 'string' ? newState.auth.error : null,
      };
      
      console.log('Migrated auth state to:', newState.auth);
    } else {
      console.log('No auth state to migrate');
      newState.auth = {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    }
    
    return newState;
  },
};

const createMigrateFn = createMigrate(migrations as any, { debug: true }); // Force debug on

// Function to safely convert to boolean
const toBoolean = (value: any): boolean => {
  if (value === 'true' || value === true || value === 1 || value === '1') return true;
  if (value === 'false' || value === false || value === 0 || value === '0') return false;
  return Boolean(value);
};

// Enhanced transform with detailed logging and type safety
// Enhanced debug logging for transforms
const logState = (prefix: string, state: any) => {
  if (__DEV__) {
    console.log(`${prefix} state type:`, typeof state);
    if (state && typeof state === 'object') {
      Object.entries(state).forEach(([key, value]) => {
        const valueType = typeof value;
        const keyStr = String(key);
        console.log(`${prefix} ${keyStr}:`, { 
          type: valueType, 
          value,
          isBoolean: valueType === 'boolean',
          isString: valueType === 'string',
          isObject: value !== null && valueType === 'object',
          isNull: value === null,
          isUndefined: value === undefined
        });
      });
    }
  }
};

const booleanCoercionTransform = createTransform(
  // inbound: state being persisted -> leave as is
  (inboundState, key) => {
    logState(`Transform IN (${String(key)})`, inboundState);
    return inboundState;
  },
  // outbound: state being rehydrated -> coerce string booleans to actual booleans
  (outboundState: any, key) => {
    try {
      if (!outboundState) {
  console.log(`Transform OUT (${String(key)}): No state to transform`);
        return outboundState;
      }
      
logState(`Transform OUT (${String(key)}) - Before`, outboundState);
      
      const stateCopy = { ...outboundState };
      
      // Handle auth state
      if (key === 'auth') {
        // Coerce top-level boolean fields
        const boolFields = ['isAuthenticated', 'loading'];
        boolFields.forEach((field) => {
          if (stateCopy[field] === 'true' || stateCopy[field] === true) {
            stateCopy[field] = true;
          } else if (stateCopy[field] === 'false' || stateCopy[field] === false) {
            stateCopy[field] = false;
          } else if (stateCopy[field] !== undefined && stateCopy[field] !== null) {
            console.warn(`Unexpected ${field} value:`, stateCopy[field]);
            stateCopy[field] = Boolean(stateCopy[field]);
          }
        });

        // Ensure _persist is properly structured
        if (stateCopy._persist) {
          stateCopy._persist = {
            ...stateCopy._persist,
            rehydrated: stateCopy._persist.rehydrated === true || 
                       stateCopy._persist.rehydrated === 'true'
          };
        }
      }
      
      logState(`Transform OUT (${String(key)}) - After`, stateCopy);
      return stateCopy;
    } catch (error) {
      const err = error as Error;
      console.error('Error in booleanCoercionTransform:', err);
      if (err) {
        console.error('Error details:', {
          key,
          outboundState,
          error: err.message,
          stack: err.stack
        });
      }
      return outboundState;
    }
  },
  // Apply transform only to auth reducer
  { whitelist: ['auth'] }
);

// NOTE: Removed custom `authTransform` object. We rely on `booleanCoercionTransform` +
// the stateReconciler/migrations to coerce types safely for the `auth` slice. The
// previous `authTransform` attempted to treat the whole root state inside a slice
// transform which could cause nested/incorrect shapes (e.g. `auth.auth`) and
// string/boolean mismatches when rehydrating. Keeping a single, well-scoped
// transform (booleanCoercionTransform) avoids these issues.

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
  version: 2, // Increment version to force migration
  debug: true, // Enable debug logging
  migrate: createMigrateFn,
  // Enhanced state reconciliation with detailed logging
  stateReconciler: (inboundState: any, originalState: any) => {
    console.log('\n=== State Reconciliation Start ===');
    console.log('Inbound state (raw):', JSON.stringify(inboundState, null, 2));
    console.log('Original state (raw):', JSON.stringify(originalState, null, 2));
    
    if (!inboundState || !inboundState.auth) {
      console.log('No valid inbound state, returning original state');
      console.log('=== State Reconciliation End ===\n');
      return originalState;
    }
    
    // Ensure we don't have any string booleans in the state
    const sanitizeState = (state: any) => {
      if (!state) return state;
      if (typeof state === 'object') {
        const newState: any = {};
        for (const key in state) {
          newState[key] = sanitizeState(state[key]);
        }
        return newState;
      }
      if (state === 'true') return true;
      if (state === 'false') return false;
      return state;
    };
    
    // Sanitize the entire state tree
    const sanitizedInboundState = {
      ...inboundState,
      auth: {
        ...inboundState.auth,
        isAuthenticated: toBoolean(inboundState.auth?.isAuthenticated),
        loading: toBoolean(inboundState.auth?.loading),
        error: inboundState.auth?.error || null,
        user: inboundState.auth?.user || null
      }
    };
    
    console.log('Sanitized inbound state:', JSON.stringify(sanitizedInboundState, null, 2));

    // Log types of all auth fields
    const logFieldTypes = (obj: any, prefix: string) => {
      if (!obj) return;
      console.log(`${prefix} field types:`, {
        isAuthenticated: {
          value: obj.isAuthenticated,
          type: typeof obj.isAuthenticated,
          isBoolean: obj.isAuthenticated === true || obj.isAuthenticated === false
        },
        loading: {
          value: obj.loading,
          type: typeof obj.loading,
          isBoolean: obj.loading === true || obj.loading === false
        },
        error: {
          value: obj.error,
          type: typeof obj.error
        },
        user: {
          value: obj.user ? '[...]' : null,
          type: typeof obj.user
        }
      });
    };

    console.log('\n--- Before Transformation ---');
    logFieldTypes(inboundState.auth, 'Inbound auth');
    logFieldTypes(originalState.auth, 'Original auth');

    // Transform the state with type safety
    const transformedAuth = {
      user: sanitizedInboundState.auth?.user || null,
      isAuthenticated: toBoolean(sanitizedInboundState.auth?.isAuthenticated),
      loading: toBoolean(sanitizedInboundState.auth?.loading),
      error: typeof sanitizedInboundState.auth?.error === 'string' ? sanitizedInboundState.auth.error : null,
    };

    const reconciledState = {
      ...originalState,
      auth: {
        ...originalState.auth,
        ...transformedAuth,
        _persist: originalState._persist // Preserve persist info
      }
    };

    console.log('\n--- After Transformation ---');
    logFieldTypes(reconciledState.auth, 'Reconciled auth');
    
    console.log('\n=== State Reconciliation End ===\n');
    return reconciledState;
  },
  transforms: [booleanCoercionTransform],
};

// Create persisted reducer with proper type handling
const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

// Enhanced middleware with error handling
const errorMiddleware = (store: any) => (next: any) => (action: any) => {
  try {
    if (action && action.type === 'persist/REHYDRATE' && action.payload) {
      console.log('REHYDRATE action payload:', {
        auth: {
          ...action.payload.auth,
          // Don't log the entire user object if it's large
          user: action.payload.auth?.user ? '[User Object]' : null,
        },
        _persist: action.payload._persist,
      });
    }
    return next(action);
  } catch (e) {
    console.error('Error in middleware:', e);
    console.error('Action that caused error:', action);
    throw e;
  }
};

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(errorMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Selectors with type safety
export const selectAuth = (state: RootState) => ({
  ...state.auth,
  isAuthenticated: Boolean(state.auth?.isAuthenticated),
  loading: Boolean(state.auth?.loading),
  // Add other fields as needed
});

// Export types
type AppDispatch = typeof store.dispatch;
type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Export hooks
// Hooks are provided in `hooks.ts` to avoid duplicate exports and keep a single
// source of truth for the typed hooks (useAppDispatch/useAppSelector).
// Types are still exported below.
export type { AppDispatch, AppThunk };
