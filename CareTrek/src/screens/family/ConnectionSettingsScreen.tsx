import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme, Switch, Card, List, Button } from 'react-native-paper';
import { FamilyService } from '../../services/family.service';
import { FamilyConnection } from '../../types/family';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FamilyStackParamList } from '../../navigation/FamilyStack';

type ConnectionSettingsScreenNavigationProp = StackNavigationProp<
  FamilyStackParamList,
  'ConnectionSettings'
>;

type ConnectionSettingsRouteProp = RouteProp<
  FamilyStackParamList,
  'ConnectionSettings'
>;

interface ConnectionSettingsScreenProps {
  route: ConnectionSettingsRouteProp;
  navigation: ConnectionSettingsScreenNavigationProp;
}

export const ConnectionSettingsScreen = ({ route, navigation }: ConnectionSettingsScreenProps) => {
  const theme = useTheme();
  const { connectionId } = route.params;
  
  const [connection, setConnection] = useState<FamilyConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    try {
      const connections = await FamilyService.getConnectionRequests();
      const conn = connections.find((c: FamilyConnection) => c.id === connectionId);
      if (conn) {
        setConnection(conn);
      }
    } catch (error) {
      console.error('Error loading connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (permission: string) => {
    if (!connection) return;
    
    try {
      setSaving(true);
      const updatedPermissions = {
        ...connection.permissions,
        [permission]: !connection.permissions[permission as keyof typeof connection.permissions]
      };
      
      await FamilyService.updatePermissions(connectionId, updatedPermissions);
      setConnection({
        ...connection,
        permissions: updatedPermissions
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      await FamilyService.removeConnection(connectionId);
      navigation.goBack();
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  if (loading || !connection) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const otherUser = connection.senior_id === connection.family_member_id 
    ? { name: connection.family_member_name, email: connection.family_member_email }
    : { name: connection.senior_name, email: connection.senior_email };

  return (
    <View style={styles.container}>
      <Card>
        <Card.Title 
          title={otherUser.name || 'Connection'} 
          subtitle={otherUser.email}
        />
        <Card.Content>
          <List.Section>
            <List.Subheader>Permissions</List.Subheader>
            <List.Item
              title="View Health Data"
              description="Allow viewing health metrics and history"
              right={props => (
                <Switch
                  value={connection.permissions.view_health}
                  onValueChange={() => handleTogglePermission('view_health')}
                  disabled={saving}
                />
              )}
            />
            <List.Item
              title="View Medications"
              description="Allow viewing medication list and history"
              right={props => (
                <Switch
                  value={connection.permissions.view_medications}
                  onValueChange={() => handleTogglePermission('view_medications')}
                  disabled={saving}
                />
              )}
            />
            <List.Item
              title="View Appointments"
              description="Allow viewing upcoming and past appointments"
              right={props => (
                <Switch
                  value={connection.permissions.view_appointments}
                  onValueChange={() => handleTogglePermission('view_appointments')}
                  disabled={saving}
                />
              )}
            />
            <List.Item
              title="View Location"
              description="Allow viewing real-time location"
              right={props => (
                <Switch
                  value={connection.permissions.view_location}
                  onValueChange={() => handleTogglePermission('view_location')}
                  disabled={saving}
                />
              )}
            />
            <List.Item
              title="Receive Notifications"
              description="Send notifications about important events"
              right={props => (
                <Switch
                  value={connection.permissions.receive_notifications}
                  onValueChange={() => handleTogglePermission('receive_notifications')}
                  disabled={saving}
                />
              )}
            />
            <List.Item
              title="Manage Medications"
              description="Allow adding and updating medications"
              right={props => (
                <Switch
                  value={connection.permissions.manage_medications}
                  onValueChange={() => handleTogglePermission('manage_medications')}
                  disabled={saving}
                />
              )}
            />
            <List.Item
              title="Manage Appointments"
              description="Allow scheduling and updating appointments"
              right={props => (
                <Switch
                  value={connection.permissions.manage_appointments}
                  onValueChange={() => handleTogglePermission('manage_appointments')}
                  disabled={saving}
                />
              )}
            />
          </List.Section>
        </Card.Content>
        <Card.Actions style={styles.dangerZone}>
          <Button 
            mode="contained" 
            color={theme.colors.error}
            onPress={handleRemoveConnection}
            loading={saving}
          >
            Remove Connection
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerZone: {
    marginTop: 16,
    justifyContent: 'center',
  },
});
