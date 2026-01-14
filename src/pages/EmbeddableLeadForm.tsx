import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadFormSettings, LeadFormField } from '@/types/leadForm';
import { CheckCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FormData {
    id: string;
    name: string;
    company_id: string;
    settings: LeadFormSettings;
    is_active: boolean;
    fields: LeadFormField[];
}

type Step = 'welcome' | number;

/**
 * Componente de formulário otimizado para uso como iframe/embed em sites externos.
 * Comunica altura e eventos para o site pai via postMessage.
 */
const EmbeddableLeadForm = () => {
    const { slug } = useParams<{ slug: string }>();
    const [form, setForm] = useState<FormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState<Step>('welcome');
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const containerRef = useRef<HTMLDivElement>(null);

    // Notifica o site pai sobre mudanças de altura
    const notifyParentHeight = () => {
        if (containerRef.current) {
            const height = containerRef.current.scrollHeight;
            window.parent.postMessage(
                {
                    type: 'brandee-form-resize',
                    height,
                    slug
                },
                '*'
            );
        }
    };

    // Notifica eventos ao site pai
    const notifyParent = (eventType: string, data?: Record<string, any>) => {
        window.parent.postMessage(
            {
                type: `brandee-form-${eventType}`,
                slug,
                ...data
            },
            '*'
        );
    };

    // Observa mudanças de tamanho e notifica o pai
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            notifyParentHeight();
        });

        resizeObserver.observe(containerRef.current);

        // Notifica carregamento inicial
        notifyParent('loaded');
        notifyParentHeight();

        return () => resizeObserver.disconnect();
    }, [form, currentStep, submitted]);

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

    const validateCurrentField = (): boolean => {
        if (typeof currentStep !== 'number' || !form) return true;

        const field = form.fields[currentStep];
        if (!field) return true;

        const value = formValues[field.field_name]?.trim() || '';

        if (field.is_required && !value) {
            setFieldError('Este campo é obrigatório');
            return false;
        }

        // Email validation
        if (field.field_type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setFieldError('Por favor, insira um e-mail válido');
                return false;
            }
        }

        setFieldError(null);
        return true;
    };

    const startForm = () => {
        setDirection('forward');
        setCurrentStep(0);
        notifyParent('started');
    };

    const goNext = () => {
        if (!validateCurrentField()) return;

        if (typeof currentStep === 'number' && form && currentStep < form.fields.length - 1) {
            setDirection('forward');
            setCurrentStep(currentStep + 1);
            setFieldError(null);
            notifyParent('step-changed', { step: currentStep + 1, total: form.fields.length });
        }
    };

    const goBack = () => {
        setDirection('backward');
        if (typeof currentStep === 'number' && currentStep > 0) {
            setCurrentStep(currentStep - 1);
            notifyParent('step-changed', { step: currentStep - 1, total: form?.fields.length || 0 });
        } else {
            setCurrentStep('welcome');
        }
        setFieldError(null);
    };

    const handleSubmit = async () => {
        if (!validateCurrentField()) return;
        if (!form) return;

        setSubmitting(true);
        try {
            const response = await supabase.functions.invoke('submit-lead-form', {
                body: {
                    formId: form.id,
                    data: formValues,
                },
            });

            if (response.error) throw response.error;

            setSubmitted(true);
            notifyParent('submitted', { data: formValues });
        } catch (err: any) {
            console.error('Error submitting form:', err);
            setError('Erro ao enviar formulário. Tente novamente.');
            notifyParent('error', { message: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (typeof currentStep === 'number' && form && currentStep === form.fields.length - 1) {
                handleSubmit();
            } else {
                goNext();
            }
        }
    };

    if (loading) {
        return (
            <div ref={containerRef} className="flex items-center justify-center p-8 bg-transparent">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !form) {
        return (
            <div ref={containerRef} className="flex items-center justify-center p-8 bg-transparent">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Oops!</h1>
                    <p className="text-gray-600">{error || 'Formulário não encontrado'}</p>
                </div>
            </div>
        );
    }

    const hasBanner = !!form.settings.bannerUrl;
    const isGradient = form.settings.backgroundColor.includes('gradient');

    const backgroundStyle = hasBanner
        ? {
            backgroundImage: `url(${form.settings.bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }
        : {
            background: isGradient ? form.settings.backgroundColor : undefined,
            backgroundColor: !isGradient ? form.settings.backgroundColor : undefined,
        };

    // Get text defaults
    const welcomeMessage = form.settings.welcomeMessage || `${form.settings.title}\n\n${form.settings.subtitle}`;
    const startButtonText = form.settings.startButtonText || 'Começar';
    const nextButtonText = form.settings.nextButtonText || 'Próximo';
    const backButtonText = form.settings.backButtonText || 'Voltar';

    // Success screen
    if (submitted) {
        return (
            <div ref={containerRef} className="flex items-center justify-center p-8" style={backgroundStyle}>
                <div className="w-full max-w-lg text-center animate-scale-in">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h2
                        className="text-xl font-bold mb-2"
                        style={{ color: hasBanner ? '#FFFFFF' : form.settings.textColor }}
                    >
                        {form.settings.successMessage}
                    </h2>
                </div>
            </div>
        );
    }

    // Welcome screen
    if (currentStep === 'welcome') {
        return (
            <div ref={containerRef} className="flex flex-col p-6" style={backgroundStyle}>
                {/* Logo */}
                {form.settings.logoUrl && (
                    <div className="mb-4">
                        <img
                            src={form.settings.logoUrl}
                            alt="Logo"
                            className="h-10 object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-lg animate-scale-in">
                        {/* Welcome Message */}
                        <div className="mb-6">
                            <p
                                className="text-lg whitespace-pre-line leading-relaxed"
                                style={{ color: hasBanner ? '#FFFFFF' : form.settings.textColor }}
                            >
                                {welcomeMessage}
                            </p>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={startForm}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-base transition-all hover:opacity-90 hover:scale-105 shadow-lg"
                            style={{
                                backgroundColor: form.settings.primaryColor,
                                color: hasBanner ? '#FFFFFF' : form.settings.textColor
                            }}
                        >
                            {startButtonText}
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* Field count indicator */}
                        <p
                            className="mt-4 text-xs opacity-70"
                            style={{ color: hasBanner ? '#FFFFFF' : form.settings.textColor }}
                        >
                            {form.fields.length} {form.fields.length === 1 ? 'pergunta' : 'perguntas'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Step form
    const currentField = form.fields[currentStep];
    const isLastStep = currentStep === form.fields.length - 1;
    const progress = ((currentStep + 1) / form.fields.length) * 100;

    const textColor = hasBanner ? '#FFFFFF' : form.settings.textColor;

    return (
        <div ref={containerRef} className="flex flex-col p-6" style={backgroundStyle}>
            {/* Logo */}
            {form.settings.logoUrl && (
                <div className="mb-6">
                    <img
                        src={form.settings.logoUrl}
                        alt="Logo"
                        className="h-8 object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 flex items-center justify-center">
                <div
                    className={cn(
                        "w-full max-w-lg",
                        direction === 'forward' ? 'animate-fade-in' : 'animate-fade-in'
                    )}
                    key={currentStep}
                >
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium opacity-70" style={{ color: textColor }}>
                                Pergunta {currentStep + 1} de {form.fields.length}
                            </span>
                            <span className="text-xs font-medium opacity-70" style={{ color: textColor }}>
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
                                value={formValues[currentField.field_name] || ''}
                                onChange={(e) => {
                                    setFormValues({ ...formValues, [currentField.field_name]: e.target.value });
                                    setFieldError(null);
                                }}
                                onKeyDown={handleKeyDown}
                                className={cn(
                                    "w-full text-base py-3 px-0 min-h-[100px] bg-transparent border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-current placeholder:opacity-50",
                                    fieldError && "border-red-500"
                                )}
                                style={{
                                    color: textColor,
                                    borderColor: hasBanner ? 'rgba(255,255,255,0.3)' : form.settings.textColor
                                }}
                                autoFocus
                            />
                        ) : currentField.field_type === 'select' ? (
                            <Select
                                value={formValues[currentField.field_name] || ''}
                                onValueChange={(value) => {
                                    setFormValues({ ...formValues, [currentField.field_name]: value });
                                    setFieldError(null);
                                }}
                            >
                                <SelectTrigger
                                    className={cn(
                                        "w-full text-base py-5 bg-transparent border-0 border-b-2 rounded-none focus:ring-0",
                                        fieldError && "border-red-500"
                                    )}
                                    style={{
                                        color: textColor,
                                        borderColor: hasBanner ? 'rgba(255,255,255,0.3)' : form.settings.textColor
                                    }}
                                >
                                    <SelectValue placeholder={currentField.placeholder || 'Selecione...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(currentField.options || []).map((opt, i) => (
                                        <SelectItem key={i} value={opt} className="text-base py-2">
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                type={
                                    currentField.field_type === 'email'
                                        ? 'email'
                                        : currentField.field_type === 'phone'
                                            ? 'tel'
                                            : currentField.field_type === 'number'
                                                ? 'number'
                                                : currentField.field_type === 'date'
                                                    ? 'date'
                                                    : 'text'
                                }
                                placeholder={currentField.placeholder || 'Sua resposta...'}
                                value={formValues[currentField.field_name] || ''}
                                onChange={(e) => {
                                    setFormValues({ ...formValues, [currentField.field_name]: e.target.value });
                                    setFieldError(null);
                                }}
                                onKeyDown={handleKeyDown}
                                className={cn(
                                    "w-full text-base py-5 px-0 bg-transparent border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-current placeholder:opacity-50",
                                    fieldError && "border-red-500"
                                )}
                                style={{
                                    color: textColor,
                                    borderColor: hasBanner ? 'rgba(255,255,255,0.3)' : form.settings.textColor
                                }}
                                autoFocus
                            />
                        )}

                        {/* Field Error */}
                        {fieldError && (
                            <p className="mt-2 text-sm text-red-400 animate-fade-in">
                                {fieldError}
                            </p>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goBack}
                            className="py-2.5 px-5 rounded-lg font-medium transition-all hover:opacity-80 flex items-center justify-center gap-2 text-sm"
                            style={{
                                backgroundColor: hasBanner ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                color: textColor
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {backButtonText}
                        </button>

                        {isLastStep ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="py-2.5 px-5 rounded-lg font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                                style={{ backgroundColor: form.settings.primaryColor, color: '#FFFFFF' }}
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {form.settings.buttonText}
                            </button>
                        ) : (
                            <button
                                onClick={goNext}
                                className="py-2.5 px-5 rounded-lg font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2 text-sm"
                                style={{ backgroundColor: form.settings.primaryColor, color: '#FFFFFF' }}
                            >
                                {nextButtonText}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Keyboard hint */}
                    <p
                        className="mt-4 text-xs opacity-50"
                        style={{ color: textColor }}
                    >
                        Pressione <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Enter ↵</kbd> para continuar
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmbeddableLeadForm;
