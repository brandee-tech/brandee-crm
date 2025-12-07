import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { LeadFormField, FIELD_TYPES, AVAILABLE_LEAD_FIELDS } from '@/types/leadForm';

interface FormFieldsEditorProps {
  fields: Omit<LeadFormField, 'id' | 'form_id' | 'created_at'>[];
  onFieldsChange: (fields: Omit<LeadFormField, 'id' | 'form_id' | 'created_at'>[]) => void;
}

export const FormFieldsEditor = ({ fields, onFieldsChange }: FormFieldsEditorProps) => {
  const [expandedField, setExpandedField] = useState<number | null>(null);

  const addField = () => {
    const newField: Omit<LeadFormField, 'id' | 'form_id' | 'created_at'> = {
      field_type: 'text',
      field_name: `field_${fields.length + 1}`,
      label: 'Novo Campo',
      placeholder: '',
      is_required: false,
      position: fields.length,
    };
    onFieldsChange([...fields, newField]);
    setExpandedField(fields.length);
  };

  const updateField = (index: number, updates: Partial<typeof fields[0]>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onFieldsChange(newFields);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    // Update positions
    newFields.forEach((f, i) => (f.position = i));
    onFieldsChange(newFields);
    if (expandedField === index) setExpandedField(null);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    // Update positions
    newFields.forEach((f, i) => (f.position = i));
    onFieldsChange(newFields);
    setExpandedField(newIndex);
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div
              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50"
              onClick={() => setExpandedField(expandedField === index ? null : index)}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 font-medium text-sm">{field.label}</span>
              <span className="text-xs text-muted-foreground">
                {FIELD_TYPES.find(t => t.value === field.field_type)?.label}
              </span>
              {field.is_required && (
                <span className="text-xs text-red-500">*</span>
              )}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveField(index, 'up');
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveField(index, 'down');
                  }}
                  disabled={index === fields.length - 1}
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(index);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedField === index && (
              <div className="p-3 pt-0 border-t space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Tipo do Campo</Label>
                    <Select
                      value={field.field_type}
                      onValueChange={(value) => updateField(index, { field_type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Mapear para Lead</Label>
                    <Select
                      value={field.maps_to_lead_field || 'none'}
                      onValueChange={(value) =>
                        updateField(index, {
                          maps_to_lead_field: value === 'none' ? undefined : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Não mapear" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Não mapear</SelectItem>
                        {AVAILABLE_LEAD_FIELDS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="Ex: Nome completo"
                  />
                </div>

                <div>
                  <Label className="text-xs">Placeholder</Label>
                  <Input
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                    placeholder="Ex: Digite seu nome"
                  />
                </div>

                {field.field_type === 'select' && (
                  <div>
                    <Label className="text-xs">Opções (uma por linha)</Label>
                    <textarea
                      className="w-full min-h-[80px] p-2 border rounded-md text-sm"
                      value={(field.options || []).join('\n')}
                      onChange={(e) =>
                        updateField(index, {
                          options: e.target.value.split('\n').filter(Boolean),
                        })
                      }
                      placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.is_required}
                    onCheckedChange={(checked) => updateField(index, { is_required: checked })}
                  />
                  <Label className="text-sm">Campo obrigatório</Label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full" onClick={addField}>
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Campo
      </Button>
    </div>
  );
};
