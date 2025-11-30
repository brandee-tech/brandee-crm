import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Phone } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useWhatsAppLeadLink } from '@/hooks/useWhatsAppLeadLink';

interface LinkContactToLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
  contactPhone?: string;
}

export const LinkContactToLeadDialog = ({
  open,
  onOpenChange,
  contactId,
  contactName,
  contactPhone,
}: LinkContactToLeadDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { leads } = useLeads();
  const { linkContactToLead } = useWhatsAppLeadLink();

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchLower) ||
      (lead.email || '').toLowerCase().includes(searchLower) ||
      (lead.phone || '').toLowerCase().includes(searchLower)
    );
  });

  const handleLinkLead = async (leadId: string) => {
    await linkContactToLead.mutateAsync({ contactId, leadId });
    onOpenChange(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Novo Lead': 'bg-gray-100 text-gray-700',
      'Atendimento': 'bg-blue-100 text-blue-700',
      'Agendamento': 'bg-orange-100 text-orange-700',
      'Vendido': 'bg-green-100 text-green-700',
      'Perdido': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Vincular contato a Lead</DialogTitle>
          <DialogDescription>
            Vincule o contato "{contactName}" a um lead existente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar lead</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[400px] border rounded-md p-4">
            <div className="space-y-2">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Nenhum lead encontrado' : 'Nenhum lead disponível'}
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleLinkLead(lead.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{lead.name}</h4>
                          <Badge className={getStatusColor(lead.status || 'Novo Lead')}>
                            {lead.status || 'Novo Lead'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {lead.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Vincular
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
