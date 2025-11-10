import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme, TextInput, Button, Text, ActivityIndicator, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFamily } from '@contexts/FamilyContext';
import { FamilyService } from '../../services/family.service';

type RootStackParamList = {
  AddFamilyMember: undefined;
  FamilyHome: undefined;
};

type AddFamilyMemberScreenProp = StackNavigationProp<RootStackParamList, 'AddFamilyMember'>;

const AddFamilyMemberScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<AddFamilyMemberScreenProp>();
  const { refreshConnections } = useFamily();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    relationship: 'Family Member',
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
await FamilyService.sendRequest(
        formData.email,
        formData.relationship
      );
      await refreshConnections();
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Avatar.Icon 
            size={100} 
            icon="account-plus" 
            style={{ backgroundColor: theme.colors.primary }}
          />
        </View>
        
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Add Family Member
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Enter the email address of the family member you want to add
        </Text>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <TextInput
          label="Email Address"
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
        />

        <TextInput
          label="Name (Optional)"
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Relationship"
          value={formData.relationship}
          onChangeText={(text) => setFormData({...formData, relationship: text})}
          style={styles.input}
          mode="outlined"
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Request'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  error: {
    color: '#f44336',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AddFamilyMemberScreen;
