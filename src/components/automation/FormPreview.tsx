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

  return (
    <div
      className="min-h-[400px] rounded-lg p-6 flex items-center justify-center"
      style={{
        background: isGradient ? settings.backgroundColor : undefined,
        backgroundColor: !isGradient ? settings.backgroundColor : undefined,
      }}
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-xl shadow-lg p-6">
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
          style={{ color: isGradient ? '#1F2937' : settings.textColor }}
        >
          {settings.title}
        </h2>
        <p
          className="text-sm text-center mb-6 opacity-70"
          style={{ color: isGradient ? '#1F2937' : settings.textColor }}
        >
          {settings.subtitle}
        </p>

        {/* Fields */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index}>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: isGradient ? '#1F2937' : settings.textColor }}
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
