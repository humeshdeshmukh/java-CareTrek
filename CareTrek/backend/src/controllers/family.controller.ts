import { Request, Response } from 'express';
import { FamilyModel, FamilyConnection } from '../models/family.model';
import { supabase } from '../server';

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

// Helper function to handle errors
function handleError(error: unknown, defaultMessage: string): { status: number; message: string } {
  console.error(error);
  if (error instanceof Error) {
    return {
      status: error.message === 'User not authenticated' ? 401 : 500,
      message: error.message || defaultMessage
    };
  }
  return { status: 500, message: defaultMessage };
}

// Default permissions for new connections
const DEFAULT_PERMISSIONS = {
  view_health: true,
  view_medications: true,
  view_appointments: true,
  view_location: true,
  receive_notifications: true,
  manage_medications: false,
  manage_appointments: false
};

// Type guard to check if an object has a 'message' property
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export const FamilyController = {
  // Send connection request
  async sendRequest(req: Request, res: Response) {
    try {
      const { senior_id, relationship } = req.body;
      const user = getAuthenticatedUser(req);
      const family_member_id = user.id;

      // Check if user is trying to connect to themselves
      if (senior_id === family_member_id) {
        return res.status(400).json({ error: 'Cannot connect to yourself' });
      }

      // Check if connection already exists
      const existingConnection = await FamilyModel.connectionExists(senior_id, family_member_id);
      if (existingConnection) {
        // Type guard to check if the connection has a status property
        const hasStatus = (conn: any): conn is { status: string } => 
          typeof conn === 'object' && conn !== null && 'status' in conn;
          
        const status = hasStatus(existingConnection) ? existingConnection.status : 'unknown';
        return res.status(400).json({ 
          error: status === 'pending' 
            ? 'Connection request already pending' 
            : 'Connection already exists' 
        });
      }

      // Create new connection request with default permissions
      await FamilyModel.createConnection({
        senior_id,
        family_member_id,
        relationship,
        permissions: DEFAULT_PERMISSIONS
      });
      
      const connection = await FamilyModel.connectionExists(senior_id, family_member_id);
      if (!connection) {
        throw new Error('Failed to create connection');
      }

      // TODO: Send notification to the senior

      res.status(201).json(connection);
    } catch (error) {
      console.error('Error sending connection request:', error);
      res.status(500).json({ error: 'Failed to send connection request' });
    }
  },

  // Get all connection requests (sent and received)
  async getConnectionRequests(req: Request, res: Response) {
    try {
      const user = getAuthenticatedUser(req);
      const userId = user.id;
      const { status } = req.query;

      let query = supabase
        .from('family_connections')
        .select(`
          id,
          senior_id,
          family_member_id,
          relationship,
          status,
          created_at,
          updated_at,
          senior:senior_id(id, email, full_name, avatar_url),
          family_member:family_member_id(id, email, full_name, avatar_url)
        `)
        .or(`senior_id.eq.${userId},family_member_id.eq.${userId}`);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Format the response to show if the request is incoming or outgoing
      const formattedData = data.map(conn => ({
        ...conn,
        type: conn.senior_id === userId ? 'outgoing' : 'incoming',
        user: conn.senior_id === userId ? conn.family_member : conn.senior
      }));

      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      res.status(500).json({ error: 'Failed to fetch connection requests' });
    }
  },

  // Respond to connection request
  async respondToRequest(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      const { status } = req.body;
      const user = getAuthenticatedUser(req);

      // Verify user has permission to respond to this request
      const connection = await FamilyModel.getConnectionById(connectionId);
      if (!connection || (connection.senior_id !== user.id && connection.family_member_id !== user.id)) {
        return res.status(403).json({ error: 'Not authorized to respond to this request' });
      }

      // Update connection status
      const updatedConnection = await FamilyModel.updateConnectionStatus(connectionId, status);
      res.json(updatedConnection);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const { status, message } = handleError(error, 'Failed to respond to connection request');
        return res.status(status).json({ error: message });
      }
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  },

  // Get all connected seniors for the current user
  async getConnectedSeniors(req: Request, res: Response) {
    try {
      const user = getAuthenticatedUser(req);
      const seniors = await FamilyModel.getConnectedSeniors(user.id);
      res.json(seniors);
    } catch (error) {
      const { status, message } = handleError(error, 'Failed to fetch connected seniors');
      res.status(status).json({ error: message });
    }
  },

  // Get all family members for a senior
  async getFamilyMembers(req: Request, res: Response) {
    try {
      const { seniorId } = req.params;
      const user = getAuthenticatedUser(req);

      // Verify the requesting user has permission to view this senior's family members
      const isSenior = seniorId === user.id;
      const connection = await FamilyModel.connectionExists(seniorId, user.id);
      const hasPermission = isSenior || (connection && connection.status === 'accepted');

      if (!hasPermission) {
        return res.status(403).json({ error: 'Not authorized to view family members' });
      }

      const familyMembers = await FamilyModel.getFamilyMembers(seniorId);
      res.json(familyMembers);
    } catch (error: unknown) {
      console.error('Error fetching family members:', error);
      if (error instanceof Error) {
        const { status, message } = handleError(error, 'Failed to fetch family members');
        return res.status(status).json({ error: message });
      }
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  },

  // Update connection permissions
  async updatePermissions(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      const { permissions } = req.body;
      const user = getAuthenticatedUser(req);

      // Verify user has permission to update these permissions
      const connection = await FamilyModel.getConnectionById(connectionId);
      if (!connection || connection.senior_id !== user.id) {
        return res.status(403).json({ error: 'Not authorized to update these permissions' });
      }

      // Update connection permissions
      const updatedConnection = await FamilyModel.updateConnectionPermissions(connectionId, permissions);
      res.json(updatedConnection);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const { status, message } = handleError(error, 'Failed to update permissions');
        return res.status(status).json({ error: message });
      }
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  },

  // Remove a connection
  async removeConnection(req: Request, res: Response) {
    try {
      const { connectionId } = req.params;
      const user = getAuthenticatedUser(req);

      // Verify user has permission to remove this connection
      const connection = await FamilyModel.getConnectionById(connectionId);
      if (!connection || (connection.senior_id !== user.id && connection.family_member_id !== user.id)) {
        return res.status(403).json({ error: 'Not authorized to remove this connection' });
      }

      await FamilyModel.removeConnection(connectionId);
      res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const { status, message } = handleError(error, 'Failed to remove connection');
        return res.status(status).json({ error: message });
      }
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  },

  // Check connection status with a senior
  async checkConnection(req: Request, res: Response) {
    try {
      const { seniorId } = req.params;
      const user = getAuthenticatedUser(req);

      // Check if user is the senior
      if (seniorId === user.id) {
        return res.json({
          isSenior: true,
          connected: false,
          status: 'self',
          permissions: {}
        });
      }

      // Check if there's an existing connection
      const connection = await FamilyModel.connectionExists(seniorId, user.id) || 
                        await FamilyModel.connectionExists(user.id, seniorId);

      if (!connection) {
        return res.json({
          isSenior: false,
          connected: false,
          status: 'not_connected',
          permissions: {}
        });
      }

      // Type guard to ensure connection has the expected properties
      const isCompleteConnection = (conn: any): conn is FamilyConnection => {
        return 'senior_id' in conn && 'status' in conn && 'permissions' in conn;
      };

      if (!isCompleteConnection(connection)) {
        return res.json({
          isSenior: false,
          connected: false,
          status: 'not_connected',
          permissions: {}
        });
      }

      // Determine the relationship direction
      const isSenior = connection.senior_id === user.id;
      const isConnected = connection.status === 'accepted';
      
      res.json({
        isSenior,
        connected: isConnected,
        status: connection.status,
        permissions: connection.permissions || {}
      });
    } catch (error) {
      const { status, message } = handleError(error, 'Failed to check connection status');
      res.status(status).json({ error: message });
    }
  }
};
