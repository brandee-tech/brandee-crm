import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FormPreview } from './FormPreview';
import { LeadForm } from '@/types/leadForm';

interface FormPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: LeadForm | null;
}

export const FormPreviewDialog = ({ open, onOpenChange, form }: FormPreviewDialogProps) => {
  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Visualização: {form.name}</h2>
        </div>
        <div className="overflow-y-auto">
          <FormPreview
            settings={form.settings}
            fields={form.fields?.map(f => ({
              field_type: f.field_type,
              field_name: f.field_name,
              label: f.label,
              placeholder: f.placeholder,
              is_required: f.is_required,
              position: f.position,
              options: f.options,
              maps_to_lead_field: f.maps_to_lead_field,
            })) || []}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
