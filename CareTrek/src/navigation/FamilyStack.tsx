import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FamilyConnectionsScreen } from '../screens/family/FamilyConnectionsScreen';
import { NewConnectionScreen } from '../screens/family/NewConnectionScreen';
import { ConnectionSettingsScreen } from '../screens/family/ConnectionSettingsScreen';

export type FamilyStackParamList = {
  FamilyConnections: undefined;
  NewConnection: undefined;
  ConnectionSettings: { connectionId: string };
};

const Stack = createStackNavigator<FamilyStackParamList>();

export const FamilyStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Stack.Screen 
        name="FamilyConnections" 
        component={FamilyConnectionsScreen} 
        options={{ title: 'Family Connections' }} 
      />
      <Stack.Screen 
        name="NewConnection" 
        component={NewConnectionScreen} 
        options={{ title: 'Add Family Member' }} 
      />
      <Stack.Screen 
        name="ConnectionSettings" 
        component={ConnectionSettingsScreen} 
        options={{ title: 'Connection Settings' }} 
      />
    </Stack.Navigator>
  );
};
