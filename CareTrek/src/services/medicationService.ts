import { supabase } from './supabase';

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  schedule: {
    times: string[];
    days: number[];
  };
  start_date: string;
  end_date?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export const getMedications = async (userId: string): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching medications:', error);
    throw error;
  }

  return data as Medication[];
};

export const getTodaysMedications = async (userId: string): Promise<Medication[]> => {
  const today = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
  
  const { data, error } = await supabase
    .rpc('get_medications_for_day', {
      p_user_id: userId,
      p_day: today,
    });

  if (error) {
    console.error('Error fetching today\'s medications:', error);
    // Fallback to client-side filtering if RPC fails
    return getMedications(userId).then(meds => 
      meds.filter(med => med.schedule.days.includes(today))
    );
  }

  return data as Medication[];
};

export const addMedication = async (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<Medication> => {
  const { data, error } = await supabase
    .from('medications')
    .insert([medication])
    .select()
    .single();

  if (error) {
    console.error('Error adding medication:', error);
    throw error;
  }

  return data as Medication;
};

export const updateMedication = async (id: string, updates: Partial<Medication>): Promise<Medication> => {
  const { data, error } = await supabase
    .from('medications')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating medication:', error);
    throw error;
  }

  return data as Medication;
};

export const deleteMedication = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting medication:', error);
    throw error;
  }
};

export const recordMedicationTaken = async (
  userId: string, 
  medicationId: string, 
  takenAt: Date = new Date(),
  status: 'taken' | 'missed' | 'skipped' = 'taken'
) => {
  const { data, error } = await supabase
    .from('medication_logs')
    .insert([{
      user_id: userId,
      medication_id: medicationId,
      status,
      taken_at: takenAt.toISOString(),
    }])
    .select()
    .single();

  if (error) {
    console.error('Error recording medication:', error);
    throw error;
  }

  return data;
};
