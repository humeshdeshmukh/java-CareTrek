import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { Circle, Path } from 'react-native-svg';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const theme = useTheme();

  const handleResetPassword = async () => {
    if (!email) {
      // TODO: Show error message
      console.error('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement password reset logic
      console.log('Password reset requested for:', email);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.successContainer}>
          <View style={[styles.iconContainer, { backgroundColor: '#E6FFFA' }]}>
            <Text style={[styles.icon, { color: '#38B2AC' }]}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successText}>
            We've sent a password reset link to {email}. Please check your inbox and follow the instructions to reset your password.
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Back to Login
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Svg width="120" height="120" viewBox="0 0 200 200" fill="none">
              <Circle cx="100" cy="100" r="80" fill={theme.colors.primary} fillOpacity="0.1"/>
              <Path d="M100 40C100 40 120 60 120 80C120 100 100 120 100 120C100 120 80 100 80 80C80 60 100 40 100 40Z" fill={theme.colors.primary}/>
              <Path d="M100 120C100 120 120 140 120 160C120 180 100 200 100 200C100 200 80 180 80 160C80 140 100 120 100 120Z" fill={theme.colors.primary}/>
              <Path d="M80 100C60 100 40 100 40 100C40 100 60 80 80 80C100 80 120 80 120 80C120 80 100 100 80 100Z" fill={theme.colors.primary}/>
              <Path d="M120 100C140 100 160 100 160 100C160 100 140 120 120 120C100 120 80 120 80 120C80 120 100 100 120 100Z" fill={theme.colors.primary}/>
            </Svg>
          </View>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Forgot Password</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Enter your email address and we'll send you a link to reset your password
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" />}
          />

          <Button 
            mode="contained" 
            onPress={handleResetPassword}
            loading={loading}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#2F855A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
    marginTop: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  footerText: {
    color: '#4A5568',
  },
  footerLink: {
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});

export default ForgotPasswordScreen;
