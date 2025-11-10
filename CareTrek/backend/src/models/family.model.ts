import { supabase } from '../lib/supabase';

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
}

export const FamilyModel = {
  // Create a new family connection request
  async createConnection(connectionData: Omit<FamilyConnection, 'id' | 'status' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('family_connections')
      .insert([{
        ...connectionData,
        status: 'pending',
        permissions: {
          view_health: true,
          view_medications: true,
          view_appointments: true,
          view_location: true,
          receive_notifications: true,
          manage_medications: false,
          manage_appointments: false,
        },
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all connections for a user
  async getConnections(userId: string) {
    const { data, error } = await supabase
      .from('family_connections')
      .select('*')
      .or(`senior_id.eq.${userId},family_member_id.eq.${userId}`);

    if (error) throw error;
    return data;
  },

  // Update connection status
  async updateConnectionStatus(connectionId: string, status: FamilyConnection['status']) {
    const { data, error } = await supabase
      .from('family_connections')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update connection permissions
  async updateConnectionPermissions(connectionId: string, permissions: Partial<FamilyConnection['permissions']>) {
    const { data, error } = await supabase
      .from('family_connections')
      .update({ 
        permissions: {
          ...permissions,
        },
        updated_at: new Date().toISOString() 
      })
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

  // Get connection by ID
  async getConnectionById(connectionId: string) {
    const { data, error } = await supabase
      .from('family_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (error) throw error;
    return data;
  },

  // Check if a connection exists between two users
  async connectionExists(seniorId: string, familyMemberId: string) {
    const { data, error } = await supabase
      .from('family_connections')
      .select('id, status')
      .eq('senior_id', seniorId)
      .eq('family_member_id', familyMemberId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Get all family members for a senior
  async getFamilyMembers(seniorId: string) {
    const { data, error } = await supabase
      .from('family_connections')
      .select(`
        id,
        relationship,
        status,
        permissions,
        created_at,
        family_member:family_member_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('senior_id', seniorId)
      .eq('status', 'accepted');

    if (error) throw error;
    return data;
  },

  // Get all seniors for a family member
  async getConnectedSeniors(familyMemberId: string) {
    const { data, error } = await supabase
      .from('family_connections')
      .select(`
        id,
        relationship,
        status,
        permissions,
        created_at,
        senior:senior_id (
          id,
          email,
          full_name,
          avatar_url,
          last_seen,
          health_status
        )
      `)
      .eq('family_member_id', familyMemberId)
      .eq('status', 'accepted');

    if (error) throw error;
    return data;
  },
};
