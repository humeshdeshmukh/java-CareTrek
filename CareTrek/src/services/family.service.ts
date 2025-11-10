import { supabase } from './supabase';

export interface FamilyConnection {
  id: string;
  senior_id: string;
  family_member_id: string;
  relationship: 'child' | 'spouse' | 'sibling' | 'caregiver' | 'other';
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  permissions: {
    view_health: boolean;
    view_medications: boolean;
    view_appointments: boolean;
    view_location: boolean;
    receive_notifications: boolean;
    manage_medications: boolean;
    manage_appointments: boolean;
  };
  created_at: string;
  updated_at: string;
  senior_name?: string;
  senior_email?: string;  // Made optional
  senior_avatar?: string | null;
  family_member_name?: string;
  family_member_email?: string;
  family_member_avatar?: string;
}

export const FamilyService = {
  // Send a connection request to a senior by ID
  async sendRequest(seniorId: string, relationship: string) {
    const { data, error } = await supabase
      .from('family_connections')
      .insert([{
        senior_id: seniorId,
        relationship,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Send a connection request by email or phone
  async sendConnectionRequest(request: {
    email?: string;
    phone?: string;
    name: string;
    relationship: string;
  }) {
    if (!request.email && !request.phone) {
      throw new Error('Email or phone number is required');
    }

    // First, search for the user by email or phone
    const { data: users, error: searchError } = await supabase
      .from('profiles')
      .select('id, email, phone')
      .or(`email.eq.${request.email},phone.eq.${request.phone}`)
      .single();

    if (searchError || !users) {
      throw new Error('User not found with the provided email or phone number');
    }

    // Then send the connection request
    const { data, error } = await supabase
      .from('family_connections')
      .insert([{
        senior_id: users.id,
        relationship: request.relationship,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all connection requests (sent and received)
  async getConnectionRequests(status?: string) {
    let query = supabase
      .from('family_connections_view')
      .select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Respond to a connection request
  async respondToRequest(connectionId: string, status: 'accepted' | 'rejected' | 'blocked') {
    const { data, error } = await supabase
      .from('family_connections')
      .update({ status })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all connected seniors for the current user
  async getConnectedSeniors() {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        console.error('No user ID found');
        return [];
      }

      const { data: connections, error } = await supabase
        .from('family_connections')
        .select('*')
        .eq('family_member_id', userId)
        .eq('status', 'accepted');

      if (error) throw error;
      
      if (!connections || connections.length === 0) return [];
      
      // Get all senior IDs
      const seniorIds = connections.map(conn => conn.senior_id);
      
      // First, check if the avatar_url column exists
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', seniorIds);
        
      if (profilesError) throw profilesError;
      
      // Map connections with their respective profiles
      return connections.map(connection => {
        const profile = profiles.find(p => p.id === connection.senior_id);
        return {
          ...connection,
          senior_name: profile?.full_name || 'Unknown',
          senior_avatar: null, // avatar_url is not available
        };
      });
    } catch (error) {
      console.error('Error in getConnectedSeniors:', error);
      throw error;
    }
  },

  // Get all family members for a senior
  async getFamilyMembers(seniorId: string) {
    try {
      // First, get the connections
      const { data: connections, error: connectionsError } = await supabase
        .from('family_connections')
        .select('*')
        .eq('senior_id', seniorId);

      if (connectionsError) throw connectionsError;
      if (!connections || connections.length === 0) return [];

      // Get all family member IDs
      const familyMemberIds = connections.map(conn => conn.family_member_id);

      // Get profiles without avatar_url
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', familyMemberIds);

      if (profilesError) throw profilesError;

      // Map connections with their respective profiles
      return connections.map(connection => {
        const profile = profiles.find(p => p.id === connection.family_member_id);
        return {
          ...connection,
          family_member_name: profile?.full_name || 'Unknown',
          family_member_avatar: null, // avatar_url is not available
        };
      });
    } catch (error) {
      console.error('Error in getFamilyMembers:', error);
      throw error;
    }
  },

  // Update connection permissions
  async updatePermissions(connectionId: string, permissions: Partial<FamilyConnection['permissions']>) {
    const { data, error } = await supabase
      .from('family_connections')
      .update({ permissions })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove a connection
  async removeConnection(connectionId: string) {
    const { error } = await supabase
      .from('family_connections')
      .delete()
      .eq('id', connectionId);

    if (error) throw error;
    return true;
  },

  // Check connection status with a senior
  async checkConnection(seniorId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from('family_connections')
      .select('*')
      .or(`and(senior_id.eq.${seniorId},family_member_id.eq.${userId}),and(senior_id.eq.${userId},family_member_id.eq.${seniorId})`)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Search for users to connect with
  async searchUsers(query: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, raw_user_meta_data->full_name as name, raw_user_meta_data->avatar_url as avatar')
      .or(`email.ilike.%${query}%,raw_user_meta_data->>full_name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data;
  }
};
