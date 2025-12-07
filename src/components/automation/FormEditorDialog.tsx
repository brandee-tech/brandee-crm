import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormTemplateSelector } from './FormTemplateSelector';
import { FormFieldsEditor } from './FormFieldsEditor';
import { FormSettingsEditor } from './FormSettingsEditor';
import { FormPreview } from './FormPreview';
import { useLeadForms } from '@/hooks/useLeadForms';
import { FORM_TEMPLATES, LeadFormSettings, LeadFormField, FormTemplate } from '@/types/leadForm';

interface FormEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form?: any;
}

export const FormEditorDialog = ({ open, onOpenChange, form }: FormEditorDialogProps) => {
  const { createForm, updateForm } = useLeadForms();
  const [step, setStep] = useState<'template' | 'editor'>('template');
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [settings, setSettings] = useState<LeadFormSettings>({
    primaryColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    buttonText: 'Enviar',
    successMessage: 'Obrigado! Entraremos em contato em breve.',
    title: 'Entre em contato',
    subtitle: 'Preencha o formulário abaixo',
  });
  const [fields, setFields] = useState<Omit<LeadFormField, 'id' | 'form_id' | 'created_at'>[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form) {
      setStep('editor');
      setName(form.name);
      setSettings(form.settings);
      setFields(
        form.fields?.map((f: LeadFormField) => ({
          field_type: f.field_type,
          field_name: f.field_name,
          label: f.label,
          placeholder: f.placeholder,
          is_required: f.is_required,
          position: f.position,
          options: f.options,
          maps_to_lead_field: f.maps_to_lead_field,
        })) || []
      );
      const template = FORM_TEMPLATES.find(t => t.id === form.template_id);
      setSelectedTemplate(template || null);
    } else {
      setStep('template');
      setName('');
      setSelectedTemplate(null);
      setSettings({
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        buttonText: 'Enviar',
        successMessage: 'Obrigado! Entraremos em contato em breve.',
        title: 'Entre em contato',
        subtitle: 'Preencha o formulário abaixo',
      });
      setFields([]);
    }
  }, [form, open]);

  const handleTemplateSelect = (template: FormTemplate) => {
    setSelectedTemplate(template);
    
    // Aplicar defaults primeiro, depois sobrescrever com valores do template
    const defaultSettings: LeadFormSettings = {
      primaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      buttonText: 'Enviar',
      successMessage: 'Obrigado! Entraremos em contato em breve.',
      title: 'Entre em contato',
      subtitle: 'Preencha o formulário abaixo',
    };
    
    setSettings({
      ...defaultSettings,
      ...template.settings,
    });
    setFields(template.defaultFields);
    setStep('editor');
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setSaving(true);
    try {
      if (form) {
        await updateForm(form.id, name, settings, fields);
      } else {
        await createForm(name, selectedTemplate?.id || 'minimal-light', settings, fields);
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {form ? 'Editar Formulário' : step === 'template' ? 'Escolha um Template' : 'Configurar Formulário'}
          </DialogTitle>
        </DialogHeader>

        {step === 'template' ? (
          <FormTemplateSelector onSelect={handleTemplateSelect} />
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-4">
              <Label htmlFor="form-name">Nome do Formulário</Label>
              <Input
                id="form-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Formulário de Contato"
                className="max-w-md"
              />
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-6">
              {/* Editor Column */}
              <div className="overflow-y-auto pr-2">
                <Tabs defaultValue="fields" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fields">Campos</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fields" className="mt-4">
                    <FormFieldsEditor fields={fields} onFieldsChange={setFields} />
                  </TabsContent>
                  <TabsContent value="settings" className="mt-4">
                    <FormSettingsEditor settings={settings} onSettingsChange={setSettings} />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Preview Column */}
              <div className="border rounded-lg overflow-hidden bg-muted/30">
                <div className="text-center text-sm text-muted-foreground py-2 bg-muted">
                  Visualização
                </div>
                <div className="p-4 h-[calc(100%-32px)] overflow-y-auto">
                  <FormPreview settings={settings} fields={fields} />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t mt-4">
              {!form && (
                <Button variant="outline" onClick={() => setStep('template')}>
                  Voltar aos Templates
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!name.trim() || saving}>
                  {saving ? 'Salvando...' : form ? 'Salvar Alterações' : 'Criar Formulário'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
