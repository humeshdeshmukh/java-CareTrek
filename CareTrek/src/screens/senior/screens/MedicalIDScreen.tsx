import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, useTheme, Switch, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MedicalIDScreen = () => {
  const theme = useTheme();
  
  // Medical information state
  const [medicalInfo, setMedicalInfo] = useState({
    fullName: 'John Doe',
    dateOfBirth: '1955-06-15',
    bloodType: 'A+',
    allergies: 'Penicillin, Peanuts',
    medications: 'Lisinopril, Metformin, Atorvastatin',
    conditions: 'Hypertension, Type 2 Diabetes',
    emergencyContact: 'Jane Smith (Daughter) - (555) 123-4567',
    doctor: 'Dr. Sarah Johnson - (555) 987-6543',
    insurance: 'Medicare Part B',
    policyNumber: 'ABC123456789',
    isVisibleOnLockScreen: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // In a real app, save to secure storage
    setIsEditing(false);
    Alert.alert('Success', 'Medical ID updated successfully');
  };

  const renderEditableField = (label: string, value: string, key: string, multiline = false) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
      {isEditing ? (
        <TextInput
          value={value}
          onChangeText={(text) => setMedicalInfo({ ...medicalInfo, [key]: text })}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          mode="outlined"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>{value || 'Not specified'}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
            {renderEditableField('Full Name', medicalInfo.fullName, 'fullName')}
            {renderEditableField('Date of Birth', medicalInfo.dateOfBirth, 'dateOfBirth')}
            {renderEditableField('Blood Type', medicalInfo.bloodType, 'bloodType')}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Medical Information
            </Text>
            {renderEditableField('Allergies', medicalInfo.allergies, 'allergies', true)}
            {renderEditableField('Current Medications', medicalInfo.medications, 'medications', true)}
            {renderEditableField('Medical Conditions', medicalInfo.conditions, 'conditions', true)}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Emergency Contacts
            </Text>
            {renderEditableField('Primary Emergency Contact', medicalInfo.emergencyContact, 'emergencyContact')}
            {renderEditableField('Primary Doctor', medicalInfo.doctor, 'doctor')}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Insurance Information
            </Text>
            {renderEditableField('Insurance Provider', medicalInfo.insurance, 'insurance')}
            {renderEditableField('Policy Number', medicalInfo.policyNumber, 'policyNumber')}
          </View>

          <View style={[styles.settingItem, { borderTopColor: theme.colors.border, borderBottomColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                Show on Lock Screen
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Allow emergency access to your Medical ID without unlocking your device
              </Text>
            </View>
            <Switch
              value={medicalInfo.isVisibleOnLockScreen}
              onValueChange={(value) => setMedicalInfo({ ...medicalInfo, isVisibleOnLockScreen: value })}
              disabled={!isEditing}
              color={theme.colors.primary}
            />
          </View>
        </Card.Content>
      </Card>

      <View style={styles.emergencyNote}>
        <MaterialCommunityIcons 
          name="alert-circle" 
          size={20} 
          color={theme.colors.error} 
          style={styles.noteIcon}
        />
        <Text style={[styles.noteText, { color: theme.colors.onSurface }]}>
          In case of emergency, first responders can access this information from your lock screen.
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
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
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
