import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ScrollView } from 'react-native-gesture-handler';
import { Text, Button, Card, useTheme, Divider, List, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useAppSelector } from '../../../store/hooks';
import { selectCurrentUser } from '../../../store/authSlice';

const ShareIDScreen = () => {
  const theme = useTheme();
  const user = useAppSelector(selectCurrentUser);
  const [shareCode, setShareCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate a unique share code for the senior
  const generateShareCode = async () => {
    try {
      setIsGenerating(true);
      // In a real app, you would generate a secure, unique code
      // and store it in your database associated with the user
      const code = `CT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Here you would save this code to your database
      // await supabase.from('user_settings').upsert({
      //   user_id: user?.id,
      //   share_code: code,
      //   updated_at: new Date().toISOString(),
      // });
      
      setShareCode(code);
      await loadShareCode();
    } catch (error) {
      console.error('Error generating share code:', error);
      Alert.alert('Error', 'Failed to generate share code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load the user's share code and family members
  const loadShareCode = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, you would fetch this from your database
      // const { data, error } = await supabase
      //   .from('user_settings')
      //   .select('share_code')
      //   .eq('user_id', user?.id)
      //   .single();
      
      // Mock data for demo
      const data = { share_code: shareCode || null };
      
      if (data?.share_code) {
        setShareCode(data.share_code);
        await loadFamilyMembers();
      }
    } catch (error) {
      console.error('Error loading share code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load the list of connected family members
  const loadFamilyMembers = async () => {
    try {
      // In a real app, you would fetch this from your database
      // const { data, error } = await supabase
      //   .from('family_connections')
      //   .select(`
      //     id,
      //     created_at,
      //     family_member:profiles!family_connections_family_member_id_fkey(
      //       id,
      //       full_name,
      //       avatar_url
      //     )
      //   `)
      //   .eq('senior_id', user?.id);
      
      // Mock data for demo
      const data = [
        {
          id: '1',
          created_at: '2023-11-09T10:00:00Z',
          family_member: {
            id: 'fm1',
            full_name: 'Jane Smith',
            avatar_url: null,
            relationship: 'Daughter'
          }
        },
        {
          id: '2',
          created_at: '2023-11-08T15:30:00Z',
          family_member: {
            id: 'fm2',
            full_name: 'John Smith Jr.',
            avatar_url: null,
            relationship: 'Son'
          }
        }
      ];
      
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error loading family members:', error);
      Alert.alert('Error', 'Failed to load family members');
    }
  };

  // Copy the share code to clipboard
  const copyToClipboard = async () => {
    if (!shareCode) return;

    try {
      await Clipboard.setStringAsync(shareCode);
      Alert.alert('Copied!', 'Share code copied to clipboard');
    } catch (err) {
      console.error('Clipboard error:', err);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  // Share the code using the device's share sheet
  const shareCodeWithOthers = async () => {
    if (!shareCode) return;
    
    try {
      await Share.share({
        message: `Use this code to connect with me on CareTrek: ${shareCode}\n\nDownload the app at: https://caretrek.app/download`,
        title: 'Connect with me on CareTrek',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Remove a family member
  const removeFamilyMember = async (connectionId: string) => {
    try {
      // In a real app, you would call your API to remove the connection
      // await supabase
      //   .from('family_connections')
      //   .delete()
      //   .eq('id', connectionId);
      
      // Refresh the list
      await loadFamilyMembers();
      Alert.alert('Success', 'Family member removed');
    } catch (error) {
      console.error('Error removing family member:', error);
      Alert.alert('Error', 'Failed to remove family member');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadShareCode();
  }, [user?.id]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Share Code Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Your Share ID
          </Text>
          
          {shareCode ? (
            <View style={styles.shareCodeContainer}>
              <Text style={[styles.shareCode, { color: theme.colors.primary }]}>
                {shareCode}
              </Text>
              <View style={styles.buttonRow}>
                <Button 
                  mode="outlined" 
                  onPress={copyToClipboard}
                  icon="content-copy"
                  style={styles.actionButton}
                >
                  Copy
                </Button>
                <Button 
                  mode="contained" 
                  onPress={shareCodeWithOthers}
                  icon="share-variant"
                  style={[styles.actionButton, { marginLeft: 8 }]}
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
                  title={member.family_member.full_name}
                  description={member.family_member.relationship || 'Family Member'}
                  left={props => (
                    <View style={styles.avatarContainer}>
                      {member.family_member.avatar_url ? (
                        <List.Image source={{ uri: member.family_member.avatar_url }} />
                      ) : (
                        <MaterialCommunityIcons 
                          name="account-circle" 
                          size={40} 
                          color={theme.colors.primary} 
                        />
                      )}
                    </View>
                  )}
                  right={props => (
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => removeFamilyMember(member.id)}
                      iconColor={theme.colors.error}
                    />
                  )}
                  style={styles.familyMemberItem}
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
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
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
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  shareCodeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  shareCode: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  noCodeContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noCodeText: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  generateButton: {
    width: '100%',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoIcon: {
    marginRight: 8,
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
  avatarContainer: {
    justifyContent: 'center',
    marginRight: 12,
  },
  familyMemberItem: {
    paddingVertical: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
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
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ShareIDScreen;
