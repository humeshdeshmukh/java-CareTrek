import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Share, Platform, RefreshControl } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ScrollView } from 'react-native-gesture-handler';
import { Text, Button, Card, useTheme, Divider, List, IconButton, ActivityIndicator, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../services/supabase';
import { useAppSelector } from '../../../store/hooks';
import { selectCurrentUser } from '../../../store/authSlice';

type FamilyMember = {
  id: string;
  created_at: string;
  family_member: {
    id: string;
    full_name: string;
    relationship: string;
    // Removed avatar_url and email as they don't exist in the database
  };
};

type ShareCodeData = {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
  updated_at: string;
};

const ShareIDScreen = () => {
  const theme = useTheme();
  const user = useAppSelector(selectCurrentUser);
  const [shareCode, setShareCode] = useState<ShareCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to create the share_codes table if it doesn't exist
  const createShareCodesTable = async () => {
    try {
      const { error } = await supabase.rpc('create_share_codes_table');
      if (error) throw error;
      console.log('Successfully created share_codes table');
    } catch (error) {
      console.error('Error creating share_codes table:', error);
      throw new Error('Failed to initialize share codes. Please contact support.');
    }
  };

  // Generate a unique share code for the senior
  const generateShareCode = async () => {
    if (!user?.id) return;
    
    try {
      setIsGenerating(true);
      
      // Generate a secure, unique code
      const code = `CT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Try to insert the share code
      const { data, error } = await supabase
        .from('share_codes')
        .upsert(
          { 
            user_id: user.id,
            code,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();
      
      if (error) {
        // If table doesn't exist, create it and retry
        if (error.code === '42P01') { // 42P01 = undefined_table
          console.log('Share codes table not found, attempting to create it...');
          await createShareCodesTable();
          // Retry after creating the table
          return generateShareCode();
        }
        throw error;
      }
      
      setShareCode(data);
      await loadFamilyMembers();
      
      Alert.alert('Success', 'Share code generated successfully!');
    } catch (error: any) {
      console.error('Error generating share code:', error);
      Alert.alert(
        'Error', 
        (error && error.message) || 'Failed to generate share code. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Load the user's share code and family members
  const loadShareCode = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch the user's share code
      const { data, error } = await supabase
        .from('share_codes')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === '42P01') { // Table doesn't exist
          console.log('Share codes table not found, attempting to create it...');
          await createShareCodesTable();
          // Don't show error to user for table creation
          return;
        } else if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }
      }
      
      if (data) {
        setShareCode(data);
      }
      
      // Load family members regardless of whether there's a share code
      await loadFamilyMembers();
    } catch (error: any) {
      console.error('Error loading share code:', error);
      Alert.alert('Error', 'Failed to load share code. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to create the family_connections table if it doesn't exist
  const createFamilyConnectionsTable = async () => {
    try {
      const { error } = await supabase.rpc('create_family_connections_table');
      if (error) throw error;
      console.log('Successfully created family_connections table');
    } catch (error: any) {
      console.error('Error creating family_connections table:', error);
      throw new Error('Failed to initialize family connections. Please contact support.');
    }
  };

  // Load the list of connected family members
  const loadFamilyMembers = async () => {
    if (!user?.id) return;
    
    try {
      // First, get the connections with basic family member info
      const { data, error } = await supabase
        .from('family_connections')
        .select(`
          id,
          created_at,
          relationship,
          family_member:family_member_id (
            id,
            full_name
          )
        `)
        .eq('senior_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        // If table doesn't exist, create it and retry
        if (error.code === '42P01') { // 42P01 = undefined_table
          console.log('Family connections table not found, attempting to create it...');
          await createFamilyConnectionsTable();
          // Return empty array for now, the table will be ready for next load
          setFamilyMembers([]);
          return;
        }
        throw error;
      }
      
      // Transform the data to match our expected format
      const formattedData = data.map((connection: any) => ({
        id: connection.id,
        created_at: connection.created_at,
        family_member: {
          id: connection.family_member?.id || '',
          full_name: connection.family_member?.full_name || 'Unknown User',
          relationship: connection.relationship || 'Family Member'
          // Removed avatar_url and email as they don't exist in the database
        }
      }));
      
      setFamilyMembers(formattedData);
    } catch (error: any) {
      console.error('Error loading family members:', error);
      Alert.alert('Error', 'Failed to load family members. Please try again.');
    }
  };
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadShareCode();
  };

  // Copy the share code to clipboard
  const copyToClipboard = async () => {
    if (!shareCode?.code) return;

    try {
      await Clipboard.setStringAsync(shareCode.code);
      Alert.alert('Copied!', 'Share code copied to clipboard');
    } catch (err) {
      console.error('Clipboard error:', err);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  // Share the code using the device's share sheet
  const shareCodeWithOthers = async () => {
    if (!shareCode?.code) return;
    
    try {
      await Share.share({
        message: `Use this code to connect with me on CareTrek: ${shareCode.code}\n\nDownload the app at: https://caretrek.app/download`,
        title: 'Connect with me on CareTrek',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Show confirmation dialog before removing a family member
  const confirmRemoveFamilyMember = (member: FamilyMember) => {
    Alert.alert(
      'Remove Family Member',
      `Are you sure you want to remove ${member.family_member.full_name || 'this member'}? They will no longer have access to your information.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFamilyMember(member.id) 
        }
      ]
    );
  };

  // Remove a family member
  const removeFamilyMember = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('family_connections')
        .delete()
        .eq('id', connectionId);
      
      if (error) throw error;
      
      // Update the local state to remove the member
      setFamilyMembers(prev => prev.filter(member => member.id !== connectionId));
      
      Alert.alert('Success', 'Family member removed successfully');
    } catch (error) {
      console.error('Error removing family member:', error);
      Alert.alert('Error', 'Failed to remove family member. Please try again.');
    }
  };
  
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Load data on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadShareCode();
    }
  }, [user?.id]);

  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Share Code Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Your Share ID
          </Text>
          
          {shareCode?.code ? (
            <View style={styles.shareCodeContainer}>
              <Text style={[styles.shareCode, { color: theme.colors.primary }]}>
                {shareCode.code}
              </Text>
              <View style={styles.codeInfo}>
                <Text style={[styles.codeInfoText, { color: (theme.colors as any).textSecondary }]}> 
                  Generated on {formatDate(shareCode.created_at)}
                </Text>
              </View>
              <View style={styles.buttonRow}>
                <Button 
                  mode="outlined" 
                  onPress={copyToClipboard}
                  icon="content-copy"
                  style={styles.actionButton}
                  contentStyle={styles.buttonContent}
                >
                  Copy
                </Button>
                <Button 
                  mode="contained" 
                  onPress={shareCodeWithOthers}
                  icon="share-variant"
                  style={[styles.actionButton, { marginLeft: 8 }]}
                  contentStyle={styles.buttonContent}
                >
                  Share
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.noCodeContainer}>
              <Text style={[styles.noCodeText, { color: theme.colors.onSurface }]}>
                You don't have a share code yet. Generate one to connect with family members.
              </Text>
              <Button 
                mode="contained" 
                onPress={generateShareCode}
                loading={isGenerating}
                disabled={isGenerating}
                style={styles.generateButton}
              >
                Generate Share Code
              </Button>
            </View>
          )}
          
          <View style={styles.infoBox}>
            <MaterialCommunityIcons 
              name="information-outline" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.infoIcon}
            />
            <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
              Share this code with family members so they can connect with you and view your health information.
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Connected Family Members */}
      <Text style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>
        Connected Family Members
      </Text>
      {familyMembers.length > 0 ? (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <List.Section>
                {familyMembers.map((member) => (
                  <React.Fragment key={member.id}>
                    <List.Item
                      key={member.id}
                      title={member.family_member.full_name}
                      description={
                        <View>
                          <Text style={{ color: theme.colors.onSurface, marginBottom: 2 }}>
                            {member.family_member.relationship || 'Family Member'}
                          </Text>
                          <Text style={{ color: (theme.colors as any).textSecondary, fontSize: 12 }}>
                            Connected on {formatDate(member.created_at)}
                          </Text>
                        </View>
                      }
                      left={props => (
                        <View style={styles.familyMemberInfo}>
                          <View style={[styles.avatar, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                            <MaterialCommunityIcons 
                              name="account" 
                              size={24} 
                              color={theme.colors.onPrimary} 
                            />
                          </View>
                          <View style={styles.familyMemberDetails}>
                            <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                              {member.family_member.full_name}
                            </Text>
                            <Text style={{ color: theme.colors.onSurface, marginBottom: 2 }}>
                              {member.family_member.relationship || 'Family Member'}
                            </Text>
                            <Text style={{ color: (theme.colors as any).textSecondary, fontSize: 12 }}>
                              Connected on {formatDate(member.created_at)}
                            </Text>
                          </View>
                        </View>
                      )}
                      right={props => (
                        <IconButton
                          icon="close"
                          size={20}
                          onPress={() => confirmRemoveFamilyMember(member)}
                          iconColor={theme.colors.error}
                          style={styles.removeButton}
                        />
                      )}
                      style={styles.familyMemberItem}
                      onPress={() => {
                        // Navigate to family member details if needed
                        // navigation.navigate('FamilyMemberDetails', { memberId: member.id });
                      }}
                    />
                    <Divider />
                  </React.Fragment>
                ))}
          </List.Section>
        </Card>
      ) : (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="account-group" 
              size={48} 
              color={theme.colors.primary} 
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
              No family members connected yet
            </Text>
            <Text style={[styles.emptySubtext, { color: (theme.colors as any).textSecondary }]}> 
              Share your code to allow family members to connect with you
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* How It Works */}
      <Text style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>
        How It Works
      </Text>
      
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Generate Your Share Code
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.onSurface }]}>
                Create a unique code that identifies your profile
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Share with Family
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.onSurface }]}>
                Send the code to family members via message, email, or any app
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Family Connects
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.onSurface }]}>
                They enter the code in their app to request access to your information
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Stay Connected
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.onSurface }]}>
                Manage who can see your information and revoke access anytime
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: (theme.colors as any).textSecondary }]}> 
          Your health data is always encrypted and secure. You control who has access.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  shareCodeContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  shareCode: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    width: '100%',
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
  },
  codeInfo: {
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  codeInfoText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  buttonContent: {
    height: 44,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  noCodeContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  noCodeText: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontSize: 15,
  },
  generateButton: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 4,
  },
  familyMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyMemberDetails: {
    marginLeft: 12,
  },
  avatar: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee', // Default primary color
  },
  familyMemberItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  removeButton: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: '#666',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    backgroundColor: '#1976d2',
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 16,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    color: '#666',
  },
});

export default ShareIDScreen;
