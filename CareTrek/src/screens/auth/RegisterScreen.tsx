import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { TextInput, Button, useTheme, RadioButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import supabase, { signUp } from '../../lib/supabase';

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

type UserType = 'senior' | 'family';

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFamily, setIsFamily] = useState(false);
  const userType = isFamily ? 'family' : 'senior';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!name || !email || !phone || !password) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Use the userType from state

    try {
      setLoading(true);
      
      // Use the new signUp function (it throws on error and returns data)
      const data = await signUp(email, password, {
        full_name: name,
        role: userType,
        phone: phone,
      });

      const user = data?.user || null;

      // Navigate to login after successful registration
      if (user) {
        alert('Registration successful! Please check your email to verify your account.');
        navigation.navigate('Login');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Svg width="120" height="120" viewBox="0 0 200 200" fill="none">
              <Circle cx="100" cy="100" r="80" fill="#8B5CF6" fillOpacity="0.1"/>
              <Path d="M100 40C100 40 120 60 120 80C120 100 100 120 100 120C100 120 80 100 80 80C80 60 100 40 100 40Z" fill="#8B5CF6"/>
              <Path d="M100 120C100 120 120 140 120 160C120 180 100 200 100 200C100 200 80 180 80 160C80 140 100 120 100 120Z" fill="#8B5CF6"/>
              <Path d="M80 100C60 100 40 100 40 100C40 100 60 80 80 80C100 80 120 80 120 80C120 80 100 100 80 100Z" fill="#8B5CF6"/>
              <Path d="M120 100C140 100 160 100 160 100C160 100 140 120 120 120C100 120 80 120 80 120C80 120 100 100 120 100Z" fill="#8B5CF6"/>
            </Svg>
          </View>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Create Account</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>I am a:</Text>
          <RadioButton.Group onValueChange={value => setIsFamily(value === 'family')} value={isFamily ? 'family' : 'senior'}>
            <View style={styles.radioGroup}>
              <View style={styles.radioButton}>
                <RadioButton.Android
                  value="senior"
                  status={!isFamily ? 'checked' : 'unchecked'}
                  color={theme.colors.primary}
                />
                <Text style={styles.radioLabel}>Senior Citizen</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton.Android
                  value="family"
                  status={isFamily ? 'checked' : 'unchecked'}
                  color={theme.colors.primary}
                />
                <Text style={styles.radioLabel}>Family Member</Text>
              </View>
            </View>
          </RadioButton.Group>

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />
          
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
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
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

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
          />

          <Button 
            mode="contained" 
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
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
  },
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2D3748',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A5568',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 16,
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
});

export default RegisterScreen;
