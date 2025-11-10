import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  useTheme, 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title, 
  Snackbar,
  ActivityIndicator,
  HelperText,
  RadioButton,
  Divider,
  IconButton
} from 'react-native-paper';
import { FamilyService } from '../../services/family.service';
import { useAuth } from '../../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { FamilyStackParamList } from '../../navigation/FamilyStack';
import { validateEmail, validatePhoneNumber } from '../../utils/validators';

type NewConnectionScreenNavigationProp = StackNavigationProp<
  FamilyStackParamList,
  'NewConnection'
>;

type RelationshipType = 'spouse' | 'parent' | 'child' | 'sibling' | 'other' | 'caregiver';

interface NewConnectionScreenProps {
  navigation: NewConnectionScreenNavigationProp;
}

interface FormData {
  email: string;
  phone: string;
  name: string;
  relationship: RelationshipType;
  customRelationship: string;
}

const relationshipTypes: { value: RelationshipType; label: string }[] = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'other', label: 'Other' },
];

export const NewConnectionScreen = ({ navigation }: NewConnectionScreenProps) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    name: '',
    relationship: 'other',
    customRelationship: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showCustomRelationship, setShowCustomRelationship] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email && !formData.phone) {
      newErrors.email = 'Email or phone number is required';
      newErrors.phone = 'Email or phone number is required';
    } else {
      if (formData.email && !validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (formData.phone && !validatePhoneNumber(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (formData.relationship === 'other' && !formData.customRelationship) {
      newErrors.customRelationship = 'Please specify the relationship';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRelationshipChange = (value: RelationshipType) => {
    setFormData(prev => ({
      ...prev,
      relationship: value,
      customRelationship: value === 'other' ? prev.customRelationship : ''
    }));
    setShowCustomRelationship(value === 'other');
  };

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleSendRequest = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const relationship = formData.relationship === 'other' 
        ? formData.customRelationship 
        : formData.relationship;

      await FamilyService.sendConnectionRequest({
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
        relationship,
      });
      
      showMessage('Connection request sent successfully');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      showMessage(error.message || 'Failed to send connection request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              />
              <Title style={styles.title}>Add Family Member</Title>
              <View style={styles.backButton} />
            </View>
            
            <Text variant="bodyMedium" style={styles.subtitle}>
              Enter the details of the family member you want to connect with
            </Text>

            <TextInput
              label="Full Name *"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              left={<TextInput.Icon icon="account" />}
            />
            {errors.name && (
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>
            )}

            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text.trim())}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              left={<TextInput.Icon icon="email" />}
            />
            {errors.email && (
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>
            )}

            <View style={styles.orContainer}>
              <View style={styles.divider} />
              <Text variant="bodyMedium" style={styles.orText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text.replace(/[^0-9+]/g, ''))}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              error={!!errors.phone}
              left={<TextInput.Icon icon="phone" />}
            />
            {errors.phone && (
              <HelperText type="error" visible={!!errors.phone}>
                {errors.phone}
              </HelperText>
            )}

            <Text variant="labelLarge" style={styles.sectionTitle}>
              Relationship
            </Text>
            
            <RadioButton.Group
              onValueChange={(value) => handleRelationshipChange(value as RelationshipType)}
              value={formData.relationship}
            >
              {relationshipTypes.map((type) => (
                <View key={type.value} style={styles.radioItem}>
                  <RadioButton.Item
                    label={type.label}
                    value={type.value}
                    position="leading"
                    labelVariant="bodyLarge"
                    style={styles.radioButton}
                  />
                </View>
              ))}
            </RadioButton.Group>

            {showCustomRelationship && (
              <View style={styles.customRelationshipContainer}>
                <TextInput
                  label="Specify Relationship"
                  value={formData.customRelationship}
                  onChangeText={(text) => handleInputChange('customRelationship', text)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.customRelationship}
                />
                {errors.customRelationship && (
                  <HelperText type="error" visible={!!errors.customRelationship}>
                    {errors.customRelationship}
                  </HelperText>
                )}
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleSendRequest}
              loading={loading}
              disabled={loading}
              style={styles.button}
              icon="account-plus"
              contentStyle={styles.buttonContent}
            >
              Send Connection Request
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    margin: -12,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    marginBottom: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 16,
    color: '#666',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioButton: {
    marginLeft: -8,
  },
  customRelationshipContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
});
