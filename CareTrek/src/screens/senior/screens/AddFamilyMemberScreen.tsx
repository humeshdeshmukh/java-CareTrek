import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme, TextInput, Button, Text, Avatar } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  phoneNumber: string;
  lastSeen: string;
  isOnline: boolean;
  avatar?: string;
};

type RootStackParamList = {
  AddFamilyMember: {
    onAddMember?: (member: FamilyMember) => void;
  };
  Chat: {
    newMember?: FamilyMember;
  };
};

type AddFamilyMemberScreenRouteProp = RouteProp<RootStackParamList, 'AddFamilyMember'>;
type AddFamilyMemberScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddFamilyMember'>;

type FamilyMemberInput = {
  name: string;
  relation: string;
  phoneNumber: string;
};

const AddFamilyMemberScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AddFamilyMemberScreenNavigationProp>();
  const route = useRoute<AddFamilyMemberScreenRouteProp>();
  const [member, setMember] = useState<FamilyMemberInput>({
    name: '',
    relation: '',
    phoneNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FamilyMemberInput, value: string) => {
    setMember(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!member.name.trim() || !member.relation.trim() || !member.phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    // Create new family member object
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: member.name.trim(),
      relation: member.relation.trim(),
      phoneNumber: member.phoneNumber.trim(),
      lastSeen: 'Just now',
      isOnline: true
    };
    
    // If there's an onAddMember callback in route params, call it
    if (route.params?.onAddMember) {
      route.params.onAddMember(newMember);
      navigation.goBack();
    } else {
      // Fallback if no callback is provided
      navigation.navigate('Chat', { newMember });
    }
  };

  const isFormValid = member.name.trim() && member.relation.trim() && member.phoneNumber.trim();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.avatarContainer}>
        <Avatar.Text 
          size={80} 
          label={member.name ? member.name.charAt(0).toUpperCase() : '?'} 
          style={{ backgroundColor: theme.colors.primary }}
          labelStyle={{ color: 'white', fontSize: 32 }}
        />
      </View>
      
      <TextInput
        label="Full Name"
        value={member.name}
        onChangeText={(text) => handleInputChange('name', text)}
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="account" />}
      />
      
      <TextInput
        label="Relationship (e.g., Son, Daughter, Caregiver)"
        value={member.relation}
        onChangeText={(text) => handleInputChange('relation', text)}
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="account-group" />}
      />
      
      <TextInput
        label="Phone Number"
        value={member.phoneNumber}
        onChangeText={(text) => handleInputChange('phoneNumber', text)}
        style={styles.input}
        mode="outlined"
        keyboardType="phone-pad"
        left={<TextInput.Icon icon="phone" />}
      />
      
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
          style={styles.button}
        >
          {isSubmitting ? 'Adding...' : 'Add Family Member'}
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={[styles.button, { marginTop: 8 }]}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
});

export default AddFamilyMemberScreen;
