import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLeads } from '@/hooks/useLeads';
import { useWhatsAppLeadLink } from '@/hooks/useWhatsAppLeadLink';
import { toast } from 'sonner';

interface CreateLeadFromWhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName?: string;
  contactPhone?: string;
}

const LEAD_SOURCES = [
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Indicação',
  'Site',
  'Outros'
];

export const CreateLeadFromWhatsAppDialog = ({
  open,
  onOpenChange,
  contactId,
  contactName = '',
  contactPhone = '',
}: CreateLeadFromWhatsAppDialogProps) => {
  const [formData, setFormData] = useState({
    name: contactName,
    email: '',
    phone: contactPhone,
    source: 'WhatsApp',
    temperature: 'Frio',
  });

  const { createLead } = useLeads();
  const { linkContactToLead } = useWhatsAppLeadLink();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Criar o lead
      const newLead = await createLead({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        status: '', // Será definido automaticamente
        source: formData.source || null,
        partner_id: null,
        assigned_to: null,
        temperature: formData.temperature || null,
        product_name: null,
        product_value: null,
        revenue_generated: null,
        revenue_lost: null,
      });

      // Vincular o contato ao lead
      if (newLead) {
        await linkContactToLead.mutateAsync({ contactId, leadId: newLead.id });
        toast.success('Lead criado e vinculado com sucesso!');
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(`Erro ao criar lead: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Lead do WhatsApp</DialogTitle>
          <DialogDescription>
            Crie um novo lead a partir deste contato do WhatsApp
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Origem</Label>
            <Select
              value={formData.source}
              onValueChange={(value) => setFormData({ ...formData, source: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">Temperatura</Label>
            <Select
              value={formData.temperature}
              onValueChange={(value) => setFormData({ ...formData, temperature: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Quente">Quente</SelectItem>
                <SelectItem value="Morno">Morno</SelectItem>
                <SelectItem value="Frio">Frio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Criar e Vincular
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
