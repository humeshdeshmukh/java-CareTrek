import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '../types/appointment';

const APPOINTMENTS_KEY = '@CareTrek:appointments';

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(APPOINTMENTS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting appointments:', error);
    return [];
  }
};

export const createAppointment = async (data: CreateAppointmentDto): Promise<Appointment> => {
  try {
    const appointments = await getAppointments();
    const newAppointment: Appointment = {
      ...data,
      id: uuidv4(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedAppointments = [...appointments, newAppointment];
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
    return newAppointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const updateAppointment = async (
  id: string, 
  updates: UpdateAppointmentDto
): Promise<Appointment> => {
  try {
    const appointments = await getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    
    const updatedAppointment = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const updatedAppointments = [...appointments];
    updatedAppointments[index] = updatedAppointment;
    
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
    return updatedAppointment;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const deleteAppointment = async (id: string): Promise<void> => {
  try {
    const appointments = await getAppointments();
    const updatedAppointments = appointments.filter(a => a.id !== id);
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
  try {
    const appointments = await getAppointments();
    const appointment = appointments.find(a => a.id === id);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    return appointment;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
};
