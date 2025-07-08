
import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { TagSelector } from './TagSelector';
import { useLeadTagAssignments } from '@/hooks/useLeadTagAssignments';
import { usePartners } from '@/hooks/usePartners';

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateLead: (leadData: {
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    source: string | null;
    partner_id: string | null;
  }) => Promise<any>;
}

const LEAD_SOURCES = [
  'Instagram',
  'Facebook',
  'TikTok',
  'Google Ads',
  'YouTube',
  'LinkedIn',
  'WhatsApp',
  'Indicação',
  'Site',
  'E-mail marketing',
  'Telefone',
  'Parceiro',
  'Outros'
];

export const AddLeadDialog = ({ open, onOpenChange, onCreateLead }: AddLeadDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Frio',
    source: '' as string,
    partner_id: '' as string,
    tags: [] as Array<{ id: string; name: string; color: string }>
  });
  const { assignTagsToLead } = useLeadTagAssignments();
  const { partners, loading: partnersLoading } = usePartners();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const createdLead = await onCreateLead({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      status: formData.status,
      source: formData.source || null,
      partner_id: formData.partner_id || null
    });

    // Se o lead foi criado com sucesso e há tags selecionadas, associar as tags
    if (createdLead && formData.tags.length > 0) {
      await assignTagsToLead(createdLead.id, formData.tags.map(tag => tag.id));
    }

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'Frio',
      source: '',
      partner_id: '',
      tags: []
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Quente">Quente</option>
              <option value="Morno">Morno</option>
              <option value="Frio">Frio</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source">Origem</Label>
            <Select
              value={formData.source || undefined}
              onValueChange={(value) => {
                setFormData(prev => ({ 
                  ...prev, 
                  source: value || '',
                  partner_id: value === 'Parceiro' ? prev.partner_id : ''
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma origem" />
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
          
          {formData.source === 'Parceiro' && (
            <div className="space-y-2">
              <Label htmlFor="partner">Parceiro *</Label>
              {partnersLoading ? (
                <div className="text-sm text-muted-foreground">Carregando parceiros...</div>
              ) : partners.length === 0 ? (
                <div className="text-sm text-yellow-600">
                  Nenhum parceiro ativo encontrado. Cadastre parceiros primeiro.
                </div>
              ) : (
                <Select
                  value={formData.partner_id || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, partner_id: value || '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um parceiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners
                      .filter(partner => partner.status === 'ativo')
                      .map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <TagSelector
              selectedTags={formData.tags}
              onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              placeholder="Selecionar tags..."
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={formData.source === 'Parceiro' && !formData.partner_id}
            >
              Criar Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
