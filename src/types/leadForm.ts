export interface LeadFormSettings {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonText: string;
  successMessage: string;
  title: string;
  subtitle: string;
  logoUrl?: string;
  bannerUrl?: string;
  // Step-by-step form settings
  welcomeMessage?: string;
  startButtonText?: string;
  nextButtonText?: string;
  backButtonText?: string;
}

export interface LeadFormField {
  id: string;
  form_id: string;
  field_type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'number' | 'date';
  field_name: string;
  label: string;
  placeholder?: string;
  is_required: boolean;
  position: number;
  options?: string[];
  maps_to_lead_field?: string;
  created_at: string;
}

export interface LeadForm {
  id: string;
  company_id: string;
  name: string;
  template_id: string;
  slug: string;
  is_active: boolean;
  settings: LeadFormSettings;
  created_by: string;
  created_at: string;
  updated_at: string;
  fields?: LeadFormField[];
  submissions_count?: number;
}

export interface LeadFormSubmission {
  id: string;
  form_id: string;
  lead_id?: string;
  data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}





export const AVAILABLE_LEAD_FIELDS = [
  { value: 'name', label: 'Nome do lead' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'product_name', label: 'Produto/Interesse' },
  { value: 'product_value', label: 'Valor estimado' },
  { value: 'temperature', label: 'Temperatura' },
];

export const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'number', label: 'Número' },
  { value: 'select', label: 'Seleção' },
  { value: 'date', label: 'Data' },
];
