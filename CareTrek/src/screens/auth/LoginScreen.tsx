import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { TextInput, Button, useTheme, Snackbar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { signIn } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const checkNetworkConnection = async () => {
    try {
      const response = await fetch('https://www.google.com', { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Network check failed:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      setSnackbarVisible(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Check network connection first
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error('No internet connection. Please check your network settings.');
      }
      
      console.log('Attempting to sign in...');
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from server. Please try again.');
      }
      
      const { user, session } = data;
      
      if (!user) {
        throw new Error('No user data received. Please try again.');
      }

      // Check if email is confirmed
      if (!user.email_confirmed_at) {
        setError('Please confirm your email before logging in. Check your inbox.');
        setSnackbarVisible(true);
        return;
      }
      
      if (!session) {
        throw new Error('Failed to create a session. Please try again.');
      }
      
      console.log('Authentication successful, proceeding to login...');
      await login(email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../../assets/ChatGPT Image Nov 6, 2025, 07_19_20 PM.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.colors.primary }]}>CareTrek</Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Your Companion in Senior Care
        </Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email" />}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon 
              icon={showPassword ? "eye-off" : "eye"} 
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          left={<TextInput.Icon icon="lock" />}
        />

        <Button
          mode="text"
          // Provide params object (empty) so TypeScript matches the overload
          onPress={() => navigation.navigate('ForgotPassword', {})}
          style={styles.forgotPassword}
          labelStyle={styles.forgotPasswordText}
        >
          Forgot Password?
        </Button>

        <Button 
          mode="contained" 
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#2F855A',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
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
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#4A5568',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#4A5568',
  },
  footerLink: {
    fontWeight: 'bold',
  },
});

export default LoginScreen;
