import { Card, CardContent } from '@/components/ui/card';
import { FORM_TEMPLATES, FormTemplate } from '@/types/leadForm';
import { Check } from 'lucide-react';

interface FormTemplateSelectorProps {
  onSelect: (template: FormTemplate) => void;
}

export const FormTemplateSelector = ({ onSelect }: FormTemplateSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
      {FORM_TEMPLATES.map((template) => (
        <Card
          key={template.id}
          className="cursor-pointer hover:ring-2 hover:ring-primary transition-all group"
          onClick={() => onSelect(template)}
        >
          <CardContent className="p-0">
            {/* Preview */}
            <div
              className={`h-32 rounded-t-lg flex items-center justify-center ${template.preview}`}
              style={
                template.settings.backgroundColor?.includes('linear-gradient')
                  ? { background: template.settings.backgroundColor }
                  : { backgroundColor: template.settings.backgroundColor }
              }
            >
              <div className="w-3/4 space-y-2">
                <div
                  className="h-3 rounded"
                  style={{ backgroundColor: `${template.settings.textColor}40` }}
                />
                <div
                  className="h-3 rounded w-2/3"
                  style={{ backgroundColor: `${template.settings.textColor}40` }}
                />
                <div
                  className="h-6 rounded mt-3"
                  style={{ backgroundColor: template.settings.primaryColor }}
                />
              </div>
            </div>
            {/* Info */}
            <div className="p-3">
              <h3 className="font-medium text-sm">{template.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
            </div>
            {/* Hover indicator */}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="bg-primary text-primary-foreground rounded-full p-2">
                <Check className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
