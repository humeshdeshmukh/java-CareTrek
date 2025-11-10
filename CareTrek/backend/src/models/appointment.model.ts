export type AppointmentType = 'doctor' | 'therapy' | 'vaccination' | 'family';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id?: string;
  title: string;
  type: AppointmentType;
  date: string;
  time: string;
  location: string;
  notes?: string | null;
  status: AppointmentStatus;
  reminder: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAppointmentDto {
  title: string;
  type: AppointmentType;
  date: string;
  time: string;
  location: string;
  notes?: string | null;
  status?: AppointmentStatus;
  reminder?: boolean;
  user_id: string;
}

export interface UpdateAppointmentDto {
  title?: string;
  type?: AppointmentType;
  date?: string;
  time?: string;
  location?: string;
  notes?: string | null;
  status?: AppointmentStatus;
  reminder?: boolean;
}
