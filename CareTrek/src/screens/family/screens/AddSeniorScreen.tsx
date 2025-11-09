import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
// Uncomment these imports when you have the actual implementations
// import { supabase } from '../../../../lib/supabase';
// import { useAppDispatch } from '../../../../store/hooks';
// import { addConnectedSenior } from '../../../../features/family/familySlice';

const AddSeniorScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  // const dispatch = useAppDispatch();
  
  const [shareCode, setShareCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Handle input change
  const handleShareCodeChange = (text: string) => {
    // Format the input to match the expected format (CT-XXXXXX)
    const formattedText = text.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setShareCode(formattedText);
  };
  
  // Validate the share code format
  const validateShareCode = (code: string) => {
    const shareCodeRegex = /^CT-[A-Z0-9]{6}$/;
    return shareCodeRegex.test(code);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!shareCode.trim()) {
      Alert.alert('Error', 'Please enter a share code');
      return;
    }
    
    if (!validateShareCode(shareCode)) {
      Alert.alert('Invalid Code', 'Please enter a valid share code in the format CT-XXXXXX');
      return;
    }
    
    try {
      setIsLoading(true);
      setIsValidating(true);
      
      // In a real app, you would validate the share code with your backend
      // const { data, error } = await supabase
      //   .from('user_settings')
      //   .select('user_id, profiles!inner(full_name, avatar_url)')
      //   .eq('share_code', shareCode)
      //   .single();
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      const data = {
        user_id: 'senior123',
        profiles: {
          full_name: 'John Senior',
          avatar_url: null,
        }
      };
      
      if (data) {
        // Check if already connected
        // const { data: existingConnection } = await supabase
        //   .from('family_connections')
        //   .select('id')
        //   .eq('senior_id', data.user_id)
        //   .eq('family_member_id', currentUser.id)
        //   .single();
        
        // if (existingConnection) {
        //   Alert.alert('Already Connected', 'You are already connected to this senior.');
        //   return;
        // }
        
        // Show connection request screen
        navigation.navigate('SeniorConnectionRequest', {
          seniorId: data.user_id,
          seniorName: data.profiles.full_name,
          avatarUrl: data.profiles.avatar_url,
          shareCode,
        });
      } else {
        Alert.alert('Not Found', 'No senior found with this share code. Please check the code and try again.');
      }
    } catch (error) {
      console.error('Error connecting to senior:', error);
      Alert.alert('Error', 'Failed to connect. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };
  
  // Handle QR code scanning (placeholder for future implementation)
  const handleScanQRCode = () => {
    // This would open the camera to scan a QR code
    Alert.alert('Scan QR Code', 'QR code scanning will be implemented in a future update.');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons 
              name="account-plus" 
              size={32} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              Connect with a Senior
            </Text>
          </View>
          
          <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>
            Enter the share code provided by the senior to connect and view their health information.
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              label="Enter Share Code"
              value={shareCode}
              onChangeText={handleShareCodeChange}
              mode="outlined"
              placeholder="CT-XXXXXX"
              autoCapitalize="characters"
              maxLength={9}
              style={styles.input}
              disabled={isLoading}
              left={
                <TextInput.Icon 
                  icon="card-account-details" 
                  color={theme.colors.primary} 
                />
              }
              right={
                <TextInput.Icon 
                  icon="qrcode-scan" 
                  onPress={handleScanQRCode}
                  disabled={isLoading}
                />
              }
            />
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading || !shareCode.trim()}
              style={styles.connectButton}
              contentStyle={styles.connectButtonContent}
            >
              {isValidating ? 'Verifying...' : 'Connect'}
            </Button>
            
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
              <Text style={[styles.dividerText, { color: theme.colors.onSurface }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            </View>
            
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Request Code', 'This will open a form to request a share code from a senior.')}
              style={styles.requestButton}
              icon="email-outline"
            >
              Request Share Code
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            How to Get a Share Code
          </Text>
          
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Ask the Senior to Open Their App
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.onSurface }]}>
                The senior should open their CareTrek app and go to the "Share ID" section
              </Text>
            </View>
          </View>
          
          <View style={styles.stepDivider} />
          
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Have Them Share Their Code
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.onSurface }]}>
                They can share their unique code via message, email, or any app
              </Text>
            </View>
          </View>
          
          <View style={styles.stepDivider} />
          
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
                Enter the Code Here
              </Text>
              <Text style={[styles.stepDescription, { color: theme.colors.onSurface }]}>
                Type or scan the code to send a connection request
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.onSurface }]}>
          Need help? Contact our support team at support@caretrek.app
        </Text>
      </View>
      
      {isValidating && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingContent, { backgroundColor: theme.colors.surface }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
              Verifying share code...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.8,
  },
  inputContainer: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  connectButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  connectButtonContent: {
    height: 48,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    opacity: 0.6,
  },
  requestButton: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  stepDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 16,
    marginLeft: 18,
    width: '85%',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddSeniorScreen;
