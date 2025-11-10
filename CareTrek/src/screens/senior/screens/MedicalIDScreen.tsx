import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Text, TextInput, Button, Card, useTheme, Switch, IconButton, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../../src/services/supabase';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

interface MedicalInfo {
  id?: string;
  full_name: string;
  date_of_birth: string;
  blood_type: string;
  allergies: string;
  medications: string;
  conditions: string;
  emergency_contact: string;
  doctor: string;
  insurance: string;
  policy_number: string;
  is_visible_on_lockscreen: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

const MedicalIDScreen = () => {
  const theme = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  
  // Medical information state with empty defaults
  const [medicalInfo, setMedicalInfo] = useState<Omit<MedicalInfo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    full_name: '',
    date_of_birth: '',
    blood_type: '',
    allergies: '',
    medications: '',
    conditions: '',
    emergency_contact: '',
    doctor: '',
    insurance: '',
    policy_number: '',
    is_visible_on_lockscreen: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch user session and medical info on mount
  useEffect(() => {
    const fetchSessionAndData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session) {
          await fetchMedicalInfo(session.user.id);
        }
      } catch (error) {
        console.error('Error fetching session or medical info:', error);
        showSnackbar('Failed to load medical information', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndData();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchMedicalInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('medical_info')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw error;
      }

      if (data) {
        setMedicalInfo({
          full_name: data.full_name || '',
          date_of_birth: data.date_of_birth || '',
          blood_type: data.blood_type || '',
          allergies: data.allergies || '',
          medications: data.medications || '',
          conditions: data.conditions || '',
          emergency_contact: data.emergency_contact || '',
          doctor: data.doctor || '',
          insurance: data.insurance || '',
          policy_number: data.policy_number || '',
          is_visible_on_lockscreen: data.is_visible_on_lockscreen ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching medical info:', error);
      throw error;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const requiredFields: (keyof typeof medicalInfo)[] = [
      'full_name',
      'date_of_birth',
      'blood_type',
      'emergency_contact',
    ];

    requiredFields.forEach(field => {
      if (!medicalInfo[field]) {
        const fieldName = field.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        errors[field] = `${fieldName} is required`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    if (!session?.user?.id) {
      showSnackbar('User not authenticated', 'error');
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('medical_info')
        .upsert(
          {
            ...medicalInfo,
            user_id: session.user.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Store in secure storage if visible on lock screen
        if (medicalInfo.is_visible_on_lockscreen) {
          await SecureStore.setItemAsync('emergency_medical_info', JSON.stringify(medicalInfo));
        } else {
          await SecureStore.deleteItemAsync('emergency_medical_info');
        }

        showSnackbar('Medical information saved successfully', 'success');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving medical info:', error);
      showSnackbar('Failed to save medical information', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };


  const renderEditableField = (
    label: string, 
    value: string, 
    key: keyof typeof medicalInfo,
    multiline = false,
    required = false,
    placeholder = ''
  ) => (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>
          {label}
          {required && <Text style={{ color: theme.colors.error }}> *</Text>}
        </Text>
        {formErrors[key] && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {formErrors[key]}
          </Text>
        )}
      </View>
      {isEditing ? (
        <TextInput
          value={value}
          onChangeText={(text) => {
            setMedicalInfo({ ...medicalInfo, [key]: text });
            // Clear error when user starts typing
            if (formErrors[key]) {
              setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
              });
            }
          }}
          style={[
            styles.input, 
            { 
              backgroundColor: theme.colors.surface,
              borderColor: formErrors[key] ? theme.colors.error : undefined,
            }
          ]}
          mode="outlined"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceDisabled}
          error={!!formErrors[key]}
        />
      ) : (
        <Text style={[styles.value, { color: value ? theme.colors.onSurface : theme.colors.onSurfaceDisabled }]}>
          {value || 'Not specified'}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Loading your medical information...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons 
              name="medical-bag" 
              size={32} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              Medical ID
            </Text>
            {!isEditing ? (
              <IconButton
                icon="pencil"
                onPress={() => setIsEditing(true)}
                iconColor={theme.colors.primary}
                size={24}
                style={styles.editButton}
              />
            ) : (
              <View style={styles.editActions}>
                <Button 
                  onPress={() => setIsEditing(false)}
                  textColor={theme.colors.error}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button 
                  onPress={handleSave}
                  mode="contained"
                  style={styles.saveButton}
                >
                  Save
                </Button>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Personal Information
            </Text>
            {renderEditableField(
              'Full Name', 
              medicalInfo.full_name, 
              'full_name',
              false,
              true,
              'John Smith'
            )}
            {renderEditableField(
              'Date of Birth', 
              medicalInfo.date_of_birth, 
              'date_of_birth',
              false,
              true,
              'YYYY-MM-DD'
            )}
            {renderEditableField(
              'Blood Type', 
              medicalInfo.blood_type, 
              'blood_type',
              false,
              true,
              'A+, B-, O+, etc.'
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Medical Information
            </Text>
            {renderEditableField(
              'Allergies', 
              medicalInfo.allergies, 
              'allergies', 
              true,
              false,
              'List any allergies (e.g., Penicillin, Peanuts)'
            )}
            {renderEditableField(
              'Current Medications', 
              medicalInfo.medications, 
              'medications', 
              true,
              false,
              'List all current medications with dosages if known'
            )}
            {renderEditableField(
              'Medical Conditions', 
              medicalInfo.conditions, 
              'conditions', 
              true,
              false,
              'List any chronic or significant medical conditions'
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Emergency Contacts
            </Text>
            {renderEditableField(
              'Primary Emergency Contact', 
              medicalInfo.emergency_contact, 
              'emergency_contact',
              false,
              true,
              'Name, Relationship, Phone (e.g., Jane Smith, Daughter, 555-123-4567)'
            )}
            {renderEditableField(
              'Primary Doctor', 
              medicalInfo.doctor, 
              'doctor',
              false,
              false,
              'Doctor\'s name and contact information'
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Insurance Information
            </Text>
            {renderEditableField(
              'Insurance Provider', 
              medicalInfo.insurance, 
              'insurance',
              false,
              false,
              'e.g., Medicare, Blue Cross, etc.'
            )}
            {renderEditableField(
              'Policy Number', 
              medicalInfo.policy_number, 
              'policy_number',
              false,
              false,
              'Your insurance policy/member ID'
            )}
          </View>

          <View style={[styles.settingItem, { borderTopColor: theme.colors.outline, borderBottomColor: theme.colors.outline }]}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                Show on Lock Screen
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                Allow emergency access to your Medical ID without unlocking your device
              </Text>
            </View>
            <Switch
              value={medicalInfo.is_visible_on_lockscreen}
              onValueChange={(value) => setMedicalInfo({ ...medicalInfo, is_visible_on_lockscreen: value })}
              disabled={!isEditing || saving}
              color={theme.colors.primary}
            />
          </View>
        </Card.Content>
      </Card>

      <View style={[styles.emergencyNote, { 
        backgroundColor: theme.colors.errorContainer,
      }]}>
        <MaterialCommunityIcons 
          name="alert-circle" 
          size={20} 
          color={theme.colors.onErrorContainer} 
          style={styles.noteIcon}
        />
        <Text style={[styles.noteText, { color: theme.colors.onErrorContainer }]}>
          {medicalInfo.is_visible_on_lockscreen 
            ? 'Your medical information will be accessible from the lock screen in case of emergency.'
            : 'Your medical information is not accessible from the lock screen.'}
        </Text>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{
          backgroundColor: snackbarType === 'error' 
            ? theme.colors.errorContainer 
            : theme.colors.inverseSurface,
        }}
      >
        <Text style={{ 
          color: snackbarType === 'error' 
            ? theme.colors.onErrorContainer 
            : theme.colors.inverseOnSurface 
        }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
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
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  editButton: {
    margin: 0,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    marginLeft: 8,
  },
  cancelButton: {
    marginRight: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  input: {
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  emergencyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  noteIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
  },
});

export default MedicalIDScreen;
