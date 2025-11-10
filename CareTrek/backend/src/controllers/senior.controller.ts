import { Request, Response } from 'express';
import { FamilyModel } from '../models/family.model';
import { supabase } from '../lib/supabase';

// Helper function to check if user is authenticated
function getAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  // Ensure the user object has the required properties
  const user = req.user as { id: string; [key: string]: any };
  if (!user.id) {
    throw new Error('Invalid user data');
  }
  return user;
}

// Helper function to check if user has permission to access senior data
async function checkSeniorAccess(userId: string, seniorId: string): Promise<{hasAccess: boolean; permissions?: any}> {
  // User can always access their own data
  if (userId === seniorId) {
    return {
      hasAccess: true,
      permissions: {
        view_health: true,
        view_medications: true,
        view_appointments: true,
        view_location: true,
        receive_notifications: true,
        manage_medications: true,
        manage_appointments: true,
      }
    };
  }

  // Check if user has an accepted connection with the senior
  const { data: connection, error } = await supabase
    .from('family_connections')
    .select('id, permissions, status')
    .eq('senior_id', seniorId)
    .eq('family_member_id', userId)
    .eq('status', 'accepted')
    .maybeSingle();

  if (error || !connection) {
    return { hasAccess: false };
  }

  return {
    hasAccess: true,
    permissions: connection.permissions
  };
}

export const SeniorController = {
  // Get senior health data
  async getHealthData(req: Request, res: Response) {
    try {
      const { seniorId } = req.params;
      const user = getAuthenticatedUser(req);
      const userId = user.id;

      // Check access
      const { hasAccess, permissions } = await checkSeniorAccess(userId, seniorId);
      if (!hasAccess || !permissions?.view_health) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Fetch health data from the database
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', seniorId)
        .order('created_at', { ascending: false })
        .limit(30); // Last 30 records

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error fetching health data:', error);
      res.status(500).json({ error: 'Failed to fetch health data' });
    }
  },

  // Get senior medications
  async getMedications(req: Request, res: Response) {
    try {
      const { seniorId } = req.params;
      const user = getAuthenticatedUser(req);
      const userId = user.id;

      // Check access
      const { hasAccess, permissions } = await checkSeniorAccess(userId, seniorId);
      if (!hasAccess || !permissions?.view_medications) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Fetch medications from the database
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', seniorId);

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).json({ error: 'Failed to fetch medications' });
    }
  },

  // Get senior appointments
  async getAppointments(req: Request, res: Response) {
    try {
      const { seniorId } = req.params;
      const user = getAuthenticatedUser(req);
      const userId = user.id;

      // Check access
      const { hasAccess, permissions } = await checkSeniorAccess(userId, seniorId);
      if (!hasAccess || !permissions?.view_appointments) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Fetch appointments from the database
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', seniorId)
        .gte('date', new Date().toISOString()) // Only future appointments
        .order('date', { ascending: true });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  },

  // Get senior location
  async getLocation(req: Request, res: Response) {
    try {
      const { seniorId } = req.params;
      const user = getAuthenticatedUser(req);
      const userId = user.id;

      // Check access
      const { hasAccess, permissions } = await checkSeniorAccess(userId, seniorId);
      if (!hasAccess || !permissions?.view_location) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Fetch latest location from the database
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', seniorId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return res.json(null);
        }
        throw error;
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching location:', error);
      res.status(500).json({ error: 'Failed to fetch location' });
    }
  },

  // Get senior activity feed
  async getActivityFeed(req: Request, res: Response) {
    try {
      const { seniorId } = req.params;
      const user = getAuthenticatedUser(req);
      const userId = user.id;
      const { limit = 20, offset = 0 } = req.query;

      // Check access
      const { hasAccess } = await checkSeniorAccess(userId, seniorId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Fetch activity feed from the database
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', seniorId)
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      res.status(500).json({ error: 'Failed to fetch activity feed' });
    }
  },

  // Get senior profile
  async getProfile(req: Request, res: Response) {
    try {
      const { seniorId } = req.params;
      const user = getAuthenticatedUser(req);
      const userId = user.id;

      // Check access
      const { hasAccess } = await checkSeniorAccess(userId, seniorId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Fetch user profile from the database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', seniorId)
        .single();

      if (error) throw error;

      // Remove sensitive information
      const { password_hash, ...profile } = data;
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },
};
