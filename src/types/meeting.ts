
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  status: 'Agendada' | 'Em andamento' | 'Finalizada' | 'Cancelada' | 'Reagendada';
  organizer_id: string;
  company_id: string;
  location?: string;
  meeting_type?: string;
  meeting_url?: string;
  rescheduled_from_id?: string;
  reschedule_reason?: string;
  rescheduled_to_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingAgenda {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
}

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingAttachment {
  id: string;
  meeting_id: string;
  name: string;
  type: 'file' | 'image' | 'link';
  url: string;
  file_size?: number;
  mime_type?: string;
  created_by: string;
  created_at: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  role: 'organizer' | 'participant';
  created_at: string;
}
