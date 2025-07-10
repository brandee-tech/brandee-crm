
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
import { useProducts } from '@/hooks/useProducts';
import { useClosers } from '@/hooks/useClosers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ErrorBoundary } from './ErrorBoundary';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  source: string | null;
  partner_id: string | null;
  assigned_to: string | null;
  temperature: string | null;
  product_name: string | null;
  product_value: number | null;
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

const EditLeadDialogContent = ({ lead, open, onOpenChange }: EditLeadDialogProps) => {
  console.log('🔍 EditLeadDialogContent rendering with props:', { lead, open });
  
  const { updateLead } = useLeads();
  const { assignTagsToLead, getLeadTags } = useLeadTagAssignments();
  const { partners = [], loading: partnersLoading } = usePartners();
  const { products = [], loading: productsLoading } = useProducts();
  const { closers = [], loading: closersLoading } = useClosers();
  const { userInfo } = useCurrentUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Novo Lead',
    source: '' as string,
    partner_id: '' as string,
    assigned_to: '' as string,
    temperature: 'Frio' as string,
    tags: [] as Array<{ id: string; name: string; color: string }>,
    product_id: '' as string,
    product_name: '',
    product_value: ''
  });
  const [loadingTags, setLoadingTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log debug para identificar problemas
  console.log('EditLeadDialog Debug:', {
    lead,
    partnersCount: partners?.length || 0,
    productsCount: products?.length || 0,
    closersCount: closers?.length || 0,
    userInfo,
    partnersLoading,
    productsLoading,
    closersLoading
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'Novo Lead',
        source: lead.source || '',
        partner_id: lead.partner_id || '',
        assigned_to: lead.assigned_to || '',
        temperature: lead.temperature || 'Frio',
        tags: [],
        product_id: '',
        product_name: lead.product_name || '',
        product_value: lead.product_value?.toString() || ''
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

    setIsSubmitting(true);
    try {
      await updateLead(lead.id, {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        status: formData.status,
        source: formData.source || null,
        partner_id: formData.partner_id || null,
        assigned_to: formData.assigned_to || null,
        temperature: formData.temperature,
        product_name: formData.product_name || null,
        product_value: formData.product_value ? parseFloat(formData.product_value) : null
      });

      // Atualizar tags do lead
      await assignTagsToLead(lead.id, formData.tags.map(tag => tag.id));

      onOpenChange(false);
      toast({
        title: "Sucesso",
        description: "Lead atualizado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lead",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-1 py-2">
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
              <option value="Novo Lead">Novo Lead</option>
              <option value="Atendimento">Atendimento</option>
              <option value="Agendamento">Agendamento</option>
              <option value="Reagendamento">Reagendamento</option>
              <option value="No Show">No Show</option>
              <option value="Follow up">Follow up</option>
              <option value="Negociação">Negociação</option>
              <option value="Vendido">Vendido</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperatura</Label>
            <select
              id="temperature"
              value={formData.temperature}
              onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
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
            <Label htmlFor="product">Produto/Serviço</Label>
            <Select
              value={formData.product_id || undefined}
              onValueChange={(value) => {
                const selectedProduct = products.find(p => p.id === value);
                setFormData(prev => ({ 
                  ...prev, 
                  product_id: value || '',
                  product_name: selectedProduct?.name || '',
                  product_value: selectedProduct?.price?.toString() || ''
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - R$ {product.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_name">Nome do Produto (Personalizado)</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
              placeholder="Ou digite um produto personalizado"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_value">Valor do Produto (R$)</Label>
            <Input
              id="product_value"
              type="number"
              step="0.01"
              min="0"
              value={formData.product_value}
              onChange={(e) => setFormData(prev => ({ ...prev, product_value: e.target.value }))}
              placeholder="0,00"
            />
          </div>
          
          {(userInfo?.role_name === 'Admin' || userInfo?.role_name === 'Gerente') && (
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Atribuído para</Label>
              {closersLoading ? (
                <div className="text-sm text-muted-foreground">Carregando closers...</div>
              ) : (
                <Select
                  value={formData.assigned_to || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value === 'unassigned' ? '' : value || '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um closer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sem atribuição</SelectItem>
                    {closers.map((closer) => (
                      <SelectItem key={closer.id} value={closer.id}>
                        {closer.full_name || closer.email}
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
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || (formData.source === 'Parceiro' && !formData.partner_id)}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const EditLeadDialog = ({ lead, open, onOpenChange }: EditLeadDialogProps) => {
  console.log('🔍 EditLeadDialog rendering with props:', { lead, open, onOpenChange });
  
  return (
    <ErrorBoundary>
      <EditLeadDialogContent lead={lead} open={open} onOpenChange={onOpenChange} />
    </ErrorBoundary>
  );
};
