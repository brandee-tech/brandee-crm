export interface WhatsAppInstance {
  id: string;
  company_id: string;
  user_id?: string;
  instance_name: string;
  instance_token?: string;
  status: 'connected' | 'disconnected' | 'pending';
  phone_number?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
  };
}

export interface WhatsAppContact {
  id: string;
  company_id: string;
  whatsapp_id: string;
  name?: string;
  phone?: string;
  profile_picture_url?: string;
  lead_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppConversation {
  id: string;
  company_id: string;
  contact_id: string;
  instance_id: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  status: 'open' | 'closed' | 'archived';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  contact?: WhatsAppContact;
  assigned_user?: {
    id: string;
    full_name: string;
  };
}

export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  company_id: string;
  whatsapp_message_id?: string;
  direction: 'incoming' | 'outgoing';
  content?: string;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
  media_url?: string;
  media_mimetype?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sender_name?: string;
  sent_by?: string;
  created_at: string;
}
