import { useState } from 'react';
import { LeadFormSettings, LeadFormField } from '@/types/leadForm';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormPreviewProps {
  settings: LeadFormSettings;
  fields: Omit<LeadFormField, 'id' | 'form_id' | 'created_at'>[];
}

type PreviewStep = 'welcome' | 'success' | number;

export const FormPreview = ({ settings, fields }: FormPreviewProps) => {
  const [previewStep, setPreviewStep] = useState<PreviewStep>('welcome');
  
  const hasBanner = !!settings.bannerUrl;
  const isGradient = settings.backgroundColor.includes('gradient');
  
  const backgroundStyle = hasBanner
    ? {
        backgroundImage: `url(${settings.bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat' as const,
      }
    : {
        background: isGradient ? settings.backgroundColor : undefined,
        backgroundColor: !isGradient ? settings.backgroundColor : undefined,
      };

  const welcomeMessage = settings.welcomeMessage || `${settings.title}\n\n${settings.subtitle}`;
  const startButtonText = settings.startButtonText || 'Começar';
  const nextButtonText = settings.nextButtonText || 'Próximo';
  const backButtonText = settings.backButtonText || 'Voltar';
  const textColor = hasBanner ? '#FFFFFF' : settings.textColor;

  const resetPreview = () => setPreviewStep('welcome');

  // Welcome screen preview
  if (previewStep === 'welcome') {
    return (
      <div
        className="min-h-[500px] rounded-lg p-6 flex flex-col"
        style={backgroundStyle}
      >
        {/* Logo */}
        {settings.logoUrl && (
          <div className="mb-auto">
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Welcome Message */}
            <p 
              className="text-base whitespace-pre-line leading-relaxed mb-6"
              style={{ color: textColor }}
            >
              {welcomeMessage}
            </p>

            {/* Start Button */}
            <button
              onClick={() => fields.length > 0 && setPreviewStep(0)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: settings.primaryColor, color: '#FFFFFF' }}
            >
              {startButtonText}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Field count */}
            <p 
              className="mt-4 text-xs opacity-70"
              style={{ color: textColor }}
            >
              {fields.length} {fields.length === 1 ? 'pergunta' : 'perguntas'}
            </p>
          </div>
        </div>

        <div className="mt-auto" />
      </div>
    );
  }

  // Success screen preview
  if (previewStep === 'success') {
    return (
      <div
        className="min-h-[500px] rounded-lg p-6 flex items-center justify-center"
        style={backgroundStyle}
      >
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: textColor }}
          >
            {settings.successMessage}
          </h2>
          <button
            onClick={resetPreview}
            className="text-sm opacity-70 hover:opacity-100 underline"
            style={{ color: textColor }}
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // Step form preview
  const currentField = fields[previewStep];
  if (!currentField) {
    return (
      <div className="min-h-[500px] rounded-lg p-6 flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Adicione campos ao formulário</p>
      </div>
    );
  }

  const isLastStep = previewStep === fields.length - 1;
  const progress = ((previewStep + 1) / fields.length) * 100;

  return (
    <div
      className="min-h-[500px] rounded-lg p-6 flex flex-col"
      style={backgroundStyle}
    >
      {/* Logo */}
      {settings.logoUrl && (
        <div className="mb-6">
          <img
            src={settings.logoUrl}
            alt="Logo"
            className="h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span 
                className="text-xs opacity-70"
                style={{ color: textColor }}
              >
                Pergunta {previewStep + 1} de {fields.length}
              </span>
              <span 
                className="text-xs opacity-70"
                style={{ color: textColor }}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-1 bg-white/20" />
          </div>

          {/* Current Field */}
          <div className="mb-6">
            <label 
              className="block text-lg font-semibold mb-3"
              style={{ color: textColor }}
            >
              {currentField.label}
              {currentField.is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            
            {currentField.field_type === 'textarea' ? (
              <Textarea
                placeholder={currentField.placeholder || 'Sua resposta...'}
                className="w-full bg-transparent border-0 border-b-2 rounded-none focus-visible:ring-0 placeholder:opacity-50"
                style={{ 
                  color: textColor, 
                  borderColor: hasBanner ? 'rgba(255,255,255,0.3)' : settings.textColor 
                }}
                disabled
              />
            ) : currentField.field_type === 'select' ? (
              <Select disabled>
                <SelectTrigger 
                  className="w-full bg-transparent border-0 border-b-2 rounded-none focus:ring-0"
                  style={{ 
                    color: textColor, 
                    borderColor: hasBanner ? 'rgba(255,255,255,0.3)' : settings.textColor 
                  }}
                >
                  <SelectValue placeholder={currentField.placeholder || 'Selecione...'} />
                </SelectTrigger>
                <SelectContent>
                  {(currentField.options || []).map((opt, i) => (
                    <SelectItem key={i} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={currentField.field_type === 'email' ? 'email' : currentField.field_type === 'phone' ? 'tel' : 'text'}
                placeholder={currentField.placeholder || 'Sua resposta...'}
                className="w-full py-5 px-0 bg-transparent border-0 border-b-2 rounded-none focus-visible:ring-0 placeholder:opacity-50"
                style={{ 
                  color: textColor, 
                  borderColor: hasBanner ? 'rgba(255,255,255,0.3)' : settings.textColor 
                }}
                disabled
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => previewStep === 0 ? setPreviewStep('welcome') : setPreviewStep(previewStep - 1)}
              className="py-2 px-4 rounded-lg font-medium transition-all hover:opacity-80 flex items-center justify-center gap-1 text-sm"
              style={{ 
                backgroundColor: hasBanner ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: textColor 
              }}
            >
              <ArrowLeft className="w-3 h-3" />
              {backButtonText}
            </button>
            
            {isLastStep ? (
              <button
                onClick={() => setPreviewStep('success')}
                className="py-2 px-4 rounded-lg font-medium transition-all hover:opacity-90 flex items-center justify-center gap-1 text-sm"
                style={{ backgroundColor: settings.primaryColor, color: '#FFFFFF' }}
              >
                {settings.buttonText}
              </button>
            ) : (
              <button
                onClick={() => setPreviewStep(previewStep + 1)}
                className="py-2 px-4 rounded-lg font-medium transition-all hover:opacity-90 flex items-center justify-center gap-1 text-sm"
                style={{ backgroundColor: settings.primaryColor, color: '#FFFFFF' }}
              >
                {nextButtonText}
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Reset link */}
          <p className="mt-3 text-center">
            <button
              onClick={resetPreview}
              className="text-xs opacity-50 hover:opacity-100 underline"
              style={{ color: textColor }}
            >
              Reiniciar preview
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};