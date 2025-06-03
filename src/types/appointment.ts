
export interface Appointment {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  duration: number;
  lead_id: string | null;
  scheduled_by: string;
  assigned_to: string;
  status: string;
  created_at: string;
  updated_at: string;
  leads?: {
    name: string;
  };
  assigned_closer?: {
    full_name: string | null;
    email: string | null;
  };
}
