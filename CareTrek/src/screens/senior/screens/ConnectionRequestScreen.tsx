import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, Avatar, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
// Uncomment these imports when you have the actual implementations
// import { supabase } from '../../../../lib/supabase';
// import { useAppSelector } from '../../../../store/hooks';
// import { selectUser } from '../../../../features/auth/authSlice';

type ConnectionRequestScreenParams = {
  familyMemberId: string;
  familyMemberName: string;
  familyMemberAvatar?: string;
  relationship?: string;
  timestamp: string;
};

const ConnectionRequestScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    familyMemberId, 
    familyMemberName, 
    familyMemberAvatar, 
    relationship = 'Family Member',
    timestamp 
  } = route.params as ConnectionRequestScreenParams;
  
  // const user = useAppSelector(selectUser);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Format the timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Handle accept connection
  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      
      // In a real app, you would update the connection status in your database
      // await supabase
      //   .from('connection_requests')
      //   .update({ status: 'accepted', responded_at: new Date().toISOString() })
      //   .eq('id', requestId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Connection Accepted',
        `${familyMemberName} can now view your health information.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Refresh any necessary data and go back
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error accepting connection:', error);
      Alert.alert('Error', 'Failed to accept connection. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle reject connection
  const handleReject = async () => {
    try {
      setIsProcessing(true);
      
      // In a real app, you would update the connection status in your database
      // await supabase
      //   .from('connection_requests')
      //   .update({ status: 'rejected', responded_at: new Date().toISOString() })
      //   .eq('id', requestId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      Alert.alert(
        'Connection Declined',
        `You've declined the connection request from ${familyMemberName}.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Go back to previous screen
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error rejecting connection:', error);
      Alert.alert('Error', 'Failed to reject connection. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <MaterialCommunityIcons 
              name="account-question" 
              size={48} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              Connection Request
            </Text>
          </View>
          
          <View style={styles.profileSection}>
            {familyMemberAvatar ? (
              <Avatar.Image 
                source={{ uri: familyMemberAvatar }} 
                size={100}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text 
                size={100}
                label={familyMemberName.split(' ').map(n => n[0]).join('').toUpperCase()}
                style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                labelStyle={styles.avatarText}
              />
            )}
            
            <Text style={[styles.name, { color: theme.colors.onSurface }]}>
              {familyMemberName}
            </Text>
            
            {relationship && (
              <Text style={[styles.relationship, { color: theme.colors.primary }]}>
                {relationship}
              </Text>
            )}
            
            <Text style={[styles.timestamp, { color: theme.colors.onSurface }]}>
              Request sent: {formatTimestamp(timestamp)}
            </Text>
          </View>
          
          <View style={styles.permissionsSection}>
            <Text style={[styles.permissionsTitle, { color: theme.colors.onSurface }]}>
              This person will be able to:
            </Text>
            
            <View style={styles.permissionItem}>
              <MaterialCommunityIcons 
                name="eye" 
                size={20} 
                color={theme.colors.primary} 
                style={styles.permissionIcon}
              />
              <Text style={[styles.permissionText, { color: theme.colors.onSurface }]}>
                View your health dashboard and activity
              </Text>
            </View>
            
            <View style={styles.permissionItem}>
              <MaterialCommunityIcons 
                name="bell" 
                size={20} 
                color={theme.colors.primary} 
                style={styles.permissionIcon}
              />
              <Text style={[styles.permissionText, { color: theme.colors.onSurface }]}>
                Receive notifications about your health alerts
              </Text>
            </View>
            
            <View style={styles.permissionItem}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={20} 
                color={theme.colors.primary} 
                style={styles.permissionIcon}
              />
              <Text style={[styles.permissionText, { color: theme.colors.onSurface }]}>
                See your location in case of emergencies
              </Text>
            </View>
            
            <Text style={[styles.note, { color: theme.colors.onSurface }]}>
              You can change these permissions anytime in your settings.
            </Text>
          </View>
          
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleReject}
              disabled={isProcessing}
              style={[styles.button, { borderColor: theme.colors.error }]}
              textColor={theme.colors.error}
              icon="close"
            >
              Decline
            </Button>
            
            <Button
              mode="contained"
              onPress={handleAccept}
              loading={isProcessing}
              disabled={isProcessing}
              style={[styles.button, { marginLeft: 12 }]}
              icon="check"
            >
              Accept
            </Button>
          </View>
          
          <Text style={[styles.termsText, { color: theme.colors.onSurface }]}>
            By accepting, you agree to share your information according to our 
            <Text style={{ color: theme.colors.primary }}> Privacy Policy</Text> and 
            <Text style={{ color: theme.colors.primary }}> Terms of Service</Text>.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  relationship: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 13,
    opacity: 0.7,
  },
  permissionsSection: {
    marginBottom: 32,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  permissionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  permissionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
});

export default ConnectionRequestScreen;
