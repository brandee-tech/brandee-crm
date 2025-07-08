
export interface AppointmentRecord {
  id: string;
  appointment_id: string;
  start_time: string;
  end_time: string;
  summary: string;
  objections?: string | null;
  next_steps?: string | null;
  outcome?: 'Fechou' | 'Não Fechou' | 'Aguardando' | 'Reagendar' | 'No Show' | null;
  notes?: string | null;
  created_by: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  appointment_id: string;
  appointment_record_id?: string | null;
  sequence_number: number;
  scheduled_date: string;
  scheduled_time: string;
  channel: 'Telefone' | 'WhatsApp' | 'Email' | 'Presencial' | 'VideoCall';
  message_sent?: string | null;
  response_received?: string | null;
  response_date?: string | null;
  result?: 'Fechou' | 'Não Fechou' | 'Aguardando' | 'Sem Resposta' | 'Reagendar' | 'No Show' | null;
  notes?: string | null;
  completed: boolean;
  completed_at?: string | null;
  created_by: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  meeting_url?: string | null;
}
