export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
export type RelationshipType = 'child' | 'spouse' | 'sibling' | 'caregiver' | 'other';

export interface FamilyConnection {
  id: string;
  senior_id: string;
  family_member_id: string;
  relationship: RelationshipType;
  status: ConnectionStatus;
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
  senior_name?: string;
  senior_email?: string;
  senior_avatar?: string;
  family_member_name?: string;
  family_member_email?: string;
  family_member_avatar?: string;
}
