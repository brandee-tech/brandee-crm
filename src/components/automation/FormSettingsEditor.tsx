import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LeadFormSettings } from '@/types/leadForm';

interface FormSettingsEditorProps {
  settings: LeadFormSettings;
  onSettingsChange: (settings: LeadFormSettings) => void;
}

export const FormSettingsEditor = ({ settings, onSettingsChange }: FormSettingsEditorProps) => {
  const updateSetting = (key: keyof LeadFormSettings, value: string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Texts */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Textos</h3>
        
        <div>
          <Label className="text-xs">Título</Label>
          <Input
            value={settings.title}
            onChange={(e) => updateSetting('title', e.target.value)}
            placeholder="Ex: Entre em contato"
          />
        </div>

        <div>
          <Label className="text-xs">Subtítulo</Label>
          <Input
            value={settings.subtitle}
            onChange={(e) => updateSetting('subtitle', e.target.value)}
            placeholder="Ex: Preencha o formulário abaixo"
          />
        </div>

        <div>
          <Label className="text-xs">Texto do Botão</Label>
          <Input
            value={settings.buttonText}
            onChange={(e) => updateSetting('buttonText', e.target.value)}
            placeholder="Ex: Enviar"
          />
        </div>

        <div>
          <Label className="text-xs">Mensagem de Sucesso</Label>
          <Textarea
            value={settings.successMessage}
            onChange={(e) => updateSetting('successMessage', e.target.value)}
            placeholder="Ex: Obrigado! Entraremos em contato em breve."
            rows={2}
          />
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Cores</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Cor Principal</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => updateSetting('primaryColor', e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={settings.primaryColor}
                onChange={(e) => updateSetting('primaryColor', e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Cor do Texto</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => updateSetting('textColor', e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={settings.textColor}
                onChange={(e) => updateSetting('textColor', e.target.value)}
                placeholder="#1F2937"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs">Cor de Fundo</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.backgroundColor.startsWith('#') ? settings.backgroundColor : '#FFFFFF'}
              onChange={(e) => updateSetting('backgroundColor', e.target.value)}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <Input
              value={settings.backgroundColor}
              onChange={(e) => updateSetting('backgroundColor', e.target.value)}
              placeholder="#FFFFFF ou linear-gradient(...)"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Você pode usar gradientes CSS como: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)
          </p>
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Logo (opcional)</h3>
        <div>
          <Label className="text-xs">URL da Logo</Label>
          <Input
            value={settings.logoUrl || ''}
            onChange={(e) => updateSetting('logoUrl', e.target.value)}
            placeholder="https://exemplo.com/logo.png"
          />
        </div>
      </div>
    </div>
  );
};
