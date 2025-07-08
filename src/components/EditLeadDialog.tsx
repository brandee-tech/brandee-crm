
import { useState, useEffect } from 'react';
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
import { useLeads } from '@/hooks/useLeads';
import { useLeadTagAssignments } from '@/hooks/useLeadTagAssignments';
import { usePartners } from '@/hooks/usePartners';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  source: string | null;
  partner_id: string | null;
  created_at: string;
}

interface EditLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export const EditLeadDialog = ({ lead, open, onOpenChange }: EditLeadDialogProps) => {
  const { updateLead } = useLeads();
  const { assignTagsToLead, getLeadTags } = useLeadTagAssignments();
  const { partners, loading: partnersLoading } = usePartners();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Frio',
    source: '' as string,
    partner_id: '' as string,
    tags: [] as Array<{ id: string; name: string; color: string }>
  });
  const [loadingTags, setLoadingTags] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'Frio',
        source: lead.source || '',
        partner_id: lead.partner_id || '',
        tags: []
      });
      
      // Carregar tags do lead
      const loadTags = async () => {
        setLoadingTags(true);
        try {
          const leadTags = await getLeadTags(lead.id);
          setFormData(prev => ({ ...prev, tags: leadTags }));
        } catch (error) {
          console.error('Erro ao carregar tags do lead:', error);
        } finally {
          setLoadingTags(false);
        }
      };
      
      loadTags();
    }
  }, [lead, getLeadTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    await updateLead(lead.id, {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      status: formData.status,
      source: formData.source || null,
      partner_id: formData.partner_id || null
    });

    // Atualizar tags do lead
    await assignTagsToLead(lead.id, formData.tags.map(tag => tag.id));

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
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
            {loadingTags ? (
              <div className="text-sm text-muted-foreground">Carregando tags...</div>
            ) : (
              <TagSelector
                selectedTags={formData.tags}
                onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                placeholder="Selecionar tags..."
              />
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={formData.source === 'Parceiro' && !formData.partner_id}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
