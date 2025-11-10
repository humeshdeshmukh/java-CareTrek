import { Request, Response } from 'express';
import { supabase } from '../server';
import { TABLES } from '../config';

interface Appointment {
  id?: string;
  title: string;
  type: 'doctor' | 'therapy' | 'vaccination' | 'family';
  date: string;
  time: string;
  location: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reminder: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { data: appointments, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('*')
      .eq('user_id', req.user?.id)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    res.json(appointments || []);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { title, type, date, time, location, notes, reminder } = req.body;
    
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const newAppointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'> = {
      title,
      type,
      date,
      time,
      location,
      notes,
      reminder,
      user_id: req.user.id,
      status: 'scheduled'
    };

    const { data, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .insert([newAppointment])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // First verify the appointment exists and belongs to the user
    const { data: existingAppointment, error: fetchError } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user?.id)
      .single();

    if (fetchError || !existingAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const { data: updatedAppointment, error: updateError } = await supabase
      .from(TABLES.APPOINTMENTS)
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First verify the appointment exists and belongs to the user
    const { data: existingAppointment, error: fetchError } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user?.id)
      .single();

    if (fetchError || !existingAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const { error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
