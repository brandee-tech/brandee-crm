import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Copy, 
  Loader2, 
  Phone, 
  Mail, 
  User, 
  Calendar,
  Merge,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useDuplicateLeads, DuplicateGroup } from '@/hooks/useDuplicateLeads';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DuplicateLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (value: number | null) => {
  if (!value) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

const getMatchTypeLabel = (matchType: 'phone' | 'email' | 'name') => {
  switch (matchType) {
    case 'phone': return 'Telefone';
    case 'email': return 'E-mail';
    case 'name': return 'Nome';
  }
};

const getMatchTypeIcon = (matchType: 'phone' | 'email' | 'name') => {
  switch (matchType) {
    case 'phone': return <Phone className="w-4 h-4" />;
    case 'email': return <Mail className="w-4 h-4" />;
    case 'name': return <User className="w-4 h-4" />;
  }
};

export const DuplicateLeadsDialog = ({ open, onOpenChange }: DuplicateLeadsDialogProps) => {
  const { 
    loading, 
    merging, 
    duplicateGroups, 
    findDuplicates, 
    mergeLeads, 
    ignoreGroup 
  } = useDuplicateLeads();

  const [selectedPrimary, setSelectedPrimary] = useState<Record<string, string>>({});
  const [confirmMerge, setConfirmMerge] = useState<DuplicateGroup | null>(null);

  // Buscar duplicatas ao abrir o dialog
  useEffect(() => {
    if (open) {
      findDuplicates();
      setSelectedPrimary({});
    }
  }, [open, findDuplicates]);

  // Selecionar o primeiro lead como primário por padrão
  useEffect(() => {
    const newSelections: Record<string, string> = {};
    duplicateGroups.forEach(group => {
      if (!selectedPrimary[group.key] && group.leads.length > 0) {
        // Selecionar o lead mais antigo como primário por padrão
        const sortedLeads = [...group.leads].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        newSelections[group.key] = sortedLeads[0].id;
      }
    });
    if (Object.keys(newSelections).length > 0) {
      setSelectedPrimary(prev => ({ ...prev, ...newSelections }));
    }
  }, [duplicateGroups]);

  const handleMerge = (group: DuplicateGroup) => {
    setConfirmMerge(group);
  };

  const confirmMergeAction = async () => {
    if (!confirmMerge) return;
    
    const primaryId = selectedPrimary[confirmMerge.key];
    const secondaryIds = confirmMerge.leads
      .filter(l => l.id !== primaryId)
      .map(l => l.id);
    
    await mergeLeads(primaryId, secondaryIds, confirmMerge.key);
    setConfirmMerge(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Localizar e Mesclar Duplicatas
            </DialogTitle>
            <DialogDescription>
              Encontre leads duplicados baseados em telefone, e-mail ou nome e mescle-os em um único registro.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Buscando leads duplicados...</p>
              </div>
            ) : duplicateGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma duplicata encontrada</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Todos os seus leads parecem ser únicos. Não foram encontrados registros duplicados baseados em telefone, e-mail ou nome.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-6 pr-4">
                  {duplicateGroups.map((group, index) => (
                    <Card key={group.key} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getMatchTypeIcon(group.matchType)}
                              {getMatchTypeLabel(group.matchType)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {group.leads.length} leads duplicados
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => ignoreGroup(group.key)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Ignorar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleMerge(group)}
                              disabled={merging}
                            >
                              <Merge className="w-4 h-4 mr-1" />
                              Mesclar
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          Selecione o lead principal que manterá os dados. Os outros leads serão mesclados nele.
                        </p>

                        <RadioGroup
                          value={selectedPrimary[group.key] || ''}
                          onValueChange={(value) => 
                            setSelectedPrimary(prev => ({ ...prev, [group.key]: value }))
                          }
                          className="space-y-3"
                        >
                          {group.leads.map((lead, leadIndex) => (
                            <div key={lead.id}>
                              {leadIndex > 0 && <Separator className="my-3" />}
                              <div className="flex items-start gap-3">
                                <RadioGroupItem value={lead.id} id={lead.id} className="mt-1" />
                                <Label 
                                  htmlFor={lead.id} 
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Nome</p>
                                      <p className="font-medium truncate">{lead.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Telefone</p>
                                      <p className="truncate">{lead.phone || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">E-mail</p>
                                      <p className="truncate">{lead.email || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Valor</p>
                                      <p>{formatCurrency(lead.product_value)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      Criado em {formatDate(lead.created_at)}
                                    </span>
                                    {lead.status && (
                                      <Badge variant="secondary" className="text-xs">
                                        {lead.status}
                                      </Badge>
                                    )}
                                    {lead.temperature && (
                                      <Badge variant="outline" className="text-xs">
                                        {lead.temperature === 'Quente' && '🔥'}
                                        {lead.temperature === 'Morno' && '🟡'}
                                        {lead.temperature === 'Frio' && '❄️'}
                                        {lead.temperature}
                                      </Badge>
                                    )}
                                  </div>
                                </Label>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {duplicateGroups.length > 0 && (
                <>
                  {duplicateGroups.length} grupo(s) de duplicatas • 
                  {duplicateGroups.reduce((sum, g) => sum + g.leads.length, 0)} leads no total
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              {duplicateGroups.length > 0 && (
                <Button onClick={() => findDuplicates()} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Reescanear
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação */}
      <AlertDialog open={!!confirmMerge} onOpenChange={() => setConfirmMerge(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Confirmar mesclagem
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Manter o lead selecionado como principal</li>
                <li>Transferir agendamentos e tags dos outros leads</li>
                <li>Preencher campos vazios com dados dos outros leads</li>
                <li>
                  <strong>Excluir permanentemente</strong> os outros {confirmMerge?.leads.length ? confirmMerge.leads.length - 1 : 0} lead(s)
                </li>
              </ul>
              <p className="mt-3 font-medium">Esta ação não pode ser desfeita.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMergeAction} disabled={merging}>
              {merging ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Merge className="w-4 h-4 mr-2" />
              )}
              Confirmar Mesclagem
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
