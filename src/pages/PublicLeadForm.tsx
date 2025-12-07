import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadFormSettings, LeadFormField } from '@/types/leadForm';
import { CheckCircle, Loader2 } from 'lucide-react';

interface FormData {
  id: string;
  name: string;
  company_id: string;
  settings: LeadFormSettings;
  is_active: boolean;
  fields: LeadFormField[];
}

const PublicLeadForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data, error } = await supabase
          .from('lead_forms')
          .select(`
            id,
            name,
            company_id,
            settings,
            is_active,
            lead_form_fields (*)
          `)
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (!data) {
          setError('Formulário não encontrado');
          return;
        }

        setForm({
          ...data,
          settings: data.settings as unknown as LeadFormSettings,
          fields: (data.lead_form_fields as unknown as LeadFormField[])?.sort((a, b) => a.position - b.position) || [],
        });
      } catch (err: any) {
        console.error('Error fetching form:', err);
        setError('Formulário não encontrado ou inativo');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchForm();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSubmitting(true);
    try {
      // Call edge function to submit form
      const response = await supabase.functions.invoke('submit-lead-form', {
        body: {
          formId: form.id,
          data: formValues,
        },
      });

      if (response.error) throw response.error;

      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600">{error || 'Formulário não encontrado'}</p>
        </div>
      </div>
    );
  }

  const isGradient = form.settings.backgroundColor.includes('gradient');

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: isGradient ? form.settings.backgroundColor : undefined,
          backgroundColor: !isGradient ? form.settings.backgroundColor : undefined,
        }}
      >
        <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-bold mb-2">{form.settings.successMessage}</h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: isGradient ? form.settings.backgroundColor : undefined,
        backgroundColor: !isGradient ? form.settings.backgroundColor : undefined,
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/95 backdrop-blur rounded-xl shadow-lg p-6"
      >
        {/* Logo */}
        {form.settings.logoUrl && (
          <div className="text-center mb-4">
            <img
              src={form.settings.logoUrl}
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
          style={{ color: isGradient ? '#1F2937' : form.settings.textColor }}
        >
          {form.settings.title}
        </h2>
        <p
          className="text-sm text-center mb-6 opacity-70"
          style={{ color: isGradient ? '#1F2937' : form.settings.textColor }}
        >
          {form.settings.subtitle}
        </p>

        {/* Fields */}
        <div className="space-y-4">
          {form.fields.map((field) => (
            <div key={field.id}>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: isGradient ? '#1F2937' : form.settings.textColor }}
              >
                {field.label}
                {field.is_required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.field_type === 'textarea' ? (
                <Textarea
                  placeholder={field.placeholder || ''}
                  value={formValues[field.field_name] || ''}
                  onChange={(e) =>
                    setFormValues({ ...formValues, [field.field_name]: e.target.value })
                  }
                  required={field.is_required}
                  className="w-full"
                />
              ) : field.field_type === 'select' ? (
                <Select
                  value={formValues[field.field_name] || ''}
                  onValueChange={(value) =>
                    setFormValues({ ...formValues, [field.field_name]: value })
                  }
                  required={field.is_required}
                >
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
                  type={
                    field.field_type === 'email'
                      ? 'email'
                      : field.field_type === 'phone'
                      ? 'tel'
                      : field.field_type === 'number'
                      ? 'number'
                      : field.field_type === 'date'
                      ? 'date'
                      : 'text'
                  }
                  placeholder={field.placeholder || ''}
                  value={formValues[field.field_name] || ''}
                  onChange={(e) =>
                    setFormValues({ ...formValues, [field.field_name]: e.target.value })
                  }
                  required={field.is_required}
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 py-3 px-4 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: form.settings.primaryColor }}
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {form.settings.buttonText}
        </button>
      </form>
    </div>
  );
};

export default PublicLeadForm;
