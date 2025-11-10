import { Request, Response, NextFunction } from 'express';
import { jwtDecode } from 'jwt-decode';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

interface JwtPayload {
  sub: string;
  email?: string;  // Make email optional to match User interface
  user_metadata?: {
    [key: string]: any;
  };
  app_metadata?: {
    [key: string]: any;
  };
}

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;  // Made optional to match JwtPayload
      role?: string;
      user_metadata?: Record<string, any>;
      app_metadata?: Record<string, any>;
    }
    
    interface Request {
      user?: User;
    }
  }
}

// Export the authenticate function
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the JWT token with Supabase
    try {
      // First, verify the token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      // Also decode the token to get additional claims if needed
      const decoded = jwtDecode<JwtPayload>(token);
      
      // Attach user to the request object
      req.user = {
        id: user.id,
        email: user.email || decoded.email || ''
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(403).json({ message: 'Invalid token' });
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

// Middleware to check if the user is the owner of the resource
export const checkOwnership = (resourceUserId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.id === resourceUserId) {
      return next();
    }
    res.status(403).json({ message: 'Not authorized to access this resource' });
  };
};
