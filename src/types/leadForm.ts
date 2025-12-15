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

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  settings: Partial<LeadFormSettings>;
  defaultFields: Omit<LeadFormField, 'id' | 'form_id' | 'created_at'>[];
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Design limpo e moderno com fundo claro',
    preview: 'bg-white',
    settings: {
      primaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      title: 'Entre em contato',
      subtitle: 'Preencha seus dados abaixo',
      buttonText: 'Enviar',
    },
    defaultFields: [
      { field_type: 'text', field_name: 'name', label: 'Nome completo', placeholder: 'Digite seu nome', is_required: true, position: 0, maps_to_lead_field: 'name' },
      { field_type: 'email', field_name: 'email', label: 'E-mail', placeholder: 'seu@email.com', is_required: true, position: 1, maps_to_lead_field: 'email' },
      { field_type: 'phone', field_name: 'phone', label: 'Telefone', placeholder: '(00) 00000-0000', is_required: false, position: 2, maps_to_lead_field: 'phone' },
    ],
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Design limpo e moderno com fundo escuro',
    preview: 'bg-gray-900',
    settings: {
      primaryColor: '#8B5CF6',
      backgroundColor: '#111827',
      textColor: '#F9FAFB',
      title: 'Fale Conosco',
      subtitle: 'Entraremos em contato em breve',
      buttonText: 'Enviar mensagem',
    },
    defaultFields: [
      { field_type: 'text', field_name: 'name', label: 'Nome completo', placeholder: 'Digite seu nome', is_required: true, position: 0, maps_to_lead_field: 'name' },
      { field_type: 'email', field_name: 'email', label: 'E-mail', placeholder: 'seu@email.com', is_required: true, position: 1, maps_to_lead_field: 'email' },
      { field_type: 'phone', field_name: 'phone', label: 'Telefone', placeholder: '(00) 00000-0000', is_required: false, position: 2, maps_to_lead_field: 'phone' },
    ],
  },
  {
    id: 'gradient-blue',
    name: 'Gradient Blue',
    description: 'Gradiente azul vibrante',
    preview: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    settings: {
      primaryColor: '#FFFFFF',
      backgroundColor: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
      textColor: '#FFFFFF',
      title: 'Vamos conversar?',
      subtitle: 'Deixe suas informações',
      buttonText: 'Quero contato',
    },
    defaultFields: [
      { field_type: 'text', field_name: 'name', label: 'Nome completo', placeholder: 'Digite seu nome', is_required: true, position: 0, maps_to_lead_field: 'name' },
      { field_type: 'email', field_name: 'email', label: 'E-mail', placeholder: 'seu@email.com', is_required: true, position: 1, maps_to_lead_field: 'email' },
      { field_type: 'phone', field_name: 'phone', label: 'Telefone', placeholder: '(00) 00000-0000', is_required: false, position: 2, maps_to_lead_field: 'phone' },
    ],
  },
  {
    id: 'gradient-purple',
    name: 'Gradient Purple',
    description: 'Gradiente roxo elegante',
    preview: 'bg-gradient-to-br from-purple-500 to-pink-500',
    settings: {
      primaryColor: '#FFFFFF',
      backgroundColor: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      textColor: '#FFFFFF',
      title: 'Conecte-se',
      subtitle: 'Queremos te conhecer',
      buttonText: 'Enviar',
    },
    defaultFields: [
      { field_type: 'text', field_name: 'name', label: 'Nome completo', placeholder: 'Digite seu nome', is_required: true, position: 0, maps_to_lead_field: 'name' },
      { field_type: 'email', field_name: 'email', label: 'E-mail', placeholder: 'seu@email.com', is_required: true, position: 1, maps_to_lead_field: 'email' },
      { field_type: 'phone', field_name: 'phone', label: 'Telefone', placeholder: '(00) 00000-0000', is_required: false, position: 2, maps_to_lead_field: 'phone' },
    ],
  },
  {
    id: 'tropical',
    name: 'Tropical',
    description: 'Cores tropicais com verde e azul',
    preview: 'bg-gradient-to-br from-teal-400 to-emerald-500',
    settings: {
      primaryColor: '#FFFFFF',
      backgroundColor: 'linear-gradient(135deg, #14B8A6 0%, #10B981 100%)',
      textColor: '#FFFFFF',
      title: 'Bem-vindo!',
      subtitle: 'Deixe seu contato',
      buttonText: 'Continuar',
    },
    defaultFields: [
      { field_type: 'text', field_name: 'name', label: 'Nome completo', placeholder: 'Digite seu nome', is_required: true, position: 0, maps_to_lead_field: 'name' },
      { field_type: 'email', field_name: 'email', label: 'E-mail', placeholder: 'seu@email.com', is_required: true, position: 1, maps_to_lead_field: 'email' },
      { field_type: 'phone', field_name: 'phone', label: 'Telefone', placeholder: '(00) 00000-0000', is_required: false, position: 2, maps_to_lead_field: 'phone' },
    ],
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Estilo corporativo profissional',
    preview: 'bg-slate-100',
    settings: {
      primaryColor: '#1E40AF',
      backgroundColor: '#F1F5F9',
      textColor: '#1E293B',
      title: 'Contato Comercial',
      subtitle: 'Preencha os dados para contato',
      buttonText: 'Solicitar contato',
    },
    defaultFields: [
      { field_type: 'text', field_name: 'name', label: 'Nome completo', placeholder: 'Digite seu nome', is_required: true, position: 0, maps_to_lead_field: 'name' },
      { field_type: 'email', field_name: 'email', label: 'E-mail corporativo', placeholder: 'seu@empresa.com', is_required: true, position: 1, maps_to_lead_field: 'email' },
      { field_type: 'phone', field_name: 'phone', label: 'Telefone', placeholder: '(00) 00000-0000', is_required: true, position: 2, maps_to_lead_field: 'phone' },
      { field_type: 'text', field_name: 'company', label: 'Empresa', placeholder: 'Nome da empresa', is_required: false, position: 3 },
    ],
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Estilo moderno com cores vibrantes',
    preview: 'bg-gradient-to-br from-orange-400 to-rose-500',
    settings: {
      primaryColor: '#FFFFFF',
      backgroundColor: 'linear-gradient(135deg, #F97316 0%, #F43F5E 100%)',
      textColor: '#FFFFFF',
      title: 'Olá!',
      subtitle: 'Estamos prontos para ajudar',
      buttonText: 'Falar agora',
    },
    defaultFields: [
      { field_type: 'text', field_name: 'name', label: 'Seu nome', placeholder: 'Como podemos te chamar?', is_required: true, position: 0, maps_to_lead_field: 'name' },
      { field_type: 'email', field_name: 'email', label: 'E-mail', placeholder: 'seu@email.com', is_required: true, position: 1, maps_to_lead_field: 'email' },
      { field_type: 'phone', field_name: 'phone', label: 'WhatsApp', placeholder: '(00) 00000-0000', is_required: false, position: 2, maps_to_lead_field: 'phone' },
    ],
  },
  {
    id: 'clean',
    name: 'Clean',
    description: 'Design minimalista e limpo',
    preview: 'bg-gray-50',
    settings: {
      primaryColor: '#000000',
      backgroundColor: '#FAFAFA',
      textColor: '#171717',
      title: 'Contato',
      subtitle: 'Simples e rápido',
      buttonText: 'Enviar',
    },
    defaultFields: [
      { field_type: 'text', field_name: 'name', label: 'Nome', placeholder: 'Seu nome', is_required: true, position: 0, maps_to_lead_field: 'name' },
      { field_type: 'email', field_name: 'email', label: 'E-mail', placeholder: 'email@exemplo.com', is_required: true, position: 1, maps_to_lead_field: 'email' },
    ],
  },
  {
    id: 'faq-style',
    name: 'FAQ Style',
    description: 'Estilo com pergunta e resposta',
    preview: 'bg-amber-50',
    settings: {
      primaryColor: '#D97706',
      backgroundColor: '#FFFBEB',
      textColor: '#78350F',
      title: 'Tem alguma dúvida?',
      subtitle: 'Preencha o formulário e entraremos em contato',
      buttonText: 'Enviar dúvida',
    },
    defaultFields: [
      { field_type: 'text', field_name: 'name', label: 'Seu nome', placeholder: 'Digite seu nome', is_required: true, position: 0, maps_to_lead_field: 'name' },
      { field_type: 'email', field_name: 'email', label: 'E-mail', placeholder: 'seu@email.com', is_required: true, position: 1, maps_to_lead_field: 'email' },
      { field_type: 'textarea', field_name: 'question', label: 'Sua dúvida', placeholder: 'Descreva sua dúvida...', is_required: true, position: 2 },
    ],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Tons de verde naturais',
    preview: 'bg-gradient-to-br from-green-700 to-green-900',
    settings: {
      primaryColor: '#86EFAC',
      backgroundColor: 'linear-gradient(135deg, #15803D 0%, #14532D 100%)',
      textColor: '#DCFCE7',
      title: 'Entre em contato',
      subtitle: 'Naturalmente simples',
      buttonText: 'Enviar',
    },
    defaultFields: [
      { field_type: 'text', field_name: 'name', label: 'Nome completo', placeholder: 'Digite seu nome', is_required: true, position: 0, maps_to_lead_field: 'name' },
      { field_type: 'email', field_name: 'email', label: 'E-mail', placeholder: 'seu@email.com', is_required: true, position: 1, maps_to_lead_field: 'email' },
      { field_type: 'phone', field_name: 'phone', label: 'Telefone', placeholder: '(00) 00000-0000', is_required: false, position: 2, maps_to_lead_field: 'phone' },
    ],
  },
];

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
