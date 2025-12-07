import { LeadFormSettings, LeadFormField } from '@/types/leadForm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormPreviewProps {
  settings: LeadFormSettings;
  fields: Omit<LeadFormField, 'id' | 'form_id' | 'created_at'>[];
}

export const FormPreview = ({ settings, fields }: FormPreviewProps) => {
  const isGradient = settings.backgroundColor.includes('gradient');
  
  // Determinar se o fundo é escuro para ajustar o card interno
  const isDarkBackground = 
    settings.backgroundColor.includes('#111') || 
    settings.backgroundColor.includes('#14532D') ||
    settings.backgroundColor.includes('#15803D') ||
    settings.textColor === '#FFFFFF' || 
    settings.textColor === '#F9FAFB' ||
    settings.textColor === '#DCFCE7';
  
  // Para gradientes, usar card branco translúcido com texto escuro
  // Para fundos sólidos escuros, usar card escuro com texto claro
  // Para fundos sólidos claros, usar card branco com texto do template
  const cardBackground = isGradient 
    ? 'rgba(255, 255, 255, 0.95)' 
    : isDarkBackground 
      ? 'rgba(30, 30, 30, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)';
  
  const cardTextColor = isGradient 
    ? '#1F2937' 
    : isDarkBackground 
      ? '#F9FAFB' 
      : settings.textColor;

  return (
    <div
      className="min-h-[400px] rounded-lg p-6 flex items-center justify-center"
      style={{
        background: isGradient ? settings.backgroundColor : undefined,
        backgroundColor: !isGradient ? settings.backgroundColor : undefined,
      }}
    >
      <div 
        className="w-full max-w-md backdrop-blur rounded-xl shadow-lg p-6"
        style={{ backgroundColor: cardBackground }}
      >
        {/* Logo */}
        {settings.logoUrl && (
          <div className="text-center mb-4">
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="h-12 mx-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Title */}
        <h2
          className="text-xl font-bold text-center mb-1"
          style={{ color: cardTextColor }}
        >
          {settings.title}
        </h2>
        <p
          className="text-sm text-center mb-6 opacity-70"
          style={{ color: cardTextColor }}
        >
          {settings.subtitle}
        </p>

        {/* Fields */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index}>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: cardTextColor }}
              >
                {field.label}
                {field.is_required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.field_type === 'textarea' ? (
                <Textarea
                  placeholder={field.placeholder}
                  className="w-full"
                  disabled
                />
              ) : field.field_type === 'select' ? (
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || 'Selecione...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options || []).map((opt, i) => (
                      <SelectItem key={i} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
                  placeholder={field.placeholder}
                  className="w-full"
                  disabled
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          className="w-full mt-6 py-3 px-4 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: settings.primaryColor }}
          disabled
        >
          {settings.buttonText}
        </button>
      </div>
    </div>
  );
};
