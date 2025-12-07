import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, MoreVertical, Plus, User, Building2, Phone, Mail, 
  Calendar, MessageSquare, Search, Filter, CheckCircle2, Clock, 
  FileText, UserPlus, Tag
} from 'lucide-react';
import { useLeadJourney, JourneyEvent } from '@/hooks/useLeadJourney';
import { useClosers } from '@/hooks/useClosers';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { useLeadTagAssignments } from '@/hooks/useLeadTagAssignments';
import { useLeads } from '@/hooks/useLeads';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TagBadge } from '@/components/TagBadge';
import { cn } from '@/lib/utils';

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
  company_id: string;
  created_at: string;
  tags?: Array<{ id: string; name: string; color: string }>;
  partner?: { id: string; name: string; } | null;
  assigned_user?: { id: string; full_name: string | null; } | null;
}

interface ViewLeadDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onLeadUpdated?: () => void;
}

// Formatar data relativa para timeline
const formatTimelineDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  } catch {
    return dateString;
  }
};

const formatEventTime = (timeString?: string) => {
  if (!timeString) return '';
  return timeString.slice(0, 5);
};

// Cor do badge baseado no tipo de evento
const getEventBadgeColor = (type: string, status?: string) => {
  switch (type) {
    case 'lead_created':
      return 'bg-blue-500';
    case 'appointment':
      if (status === 'Completed') return 'bg-green-500';
      if (status === 'No Show') return 'bg-red-500';
      return 'bg-amber-500';
    case 'follow_up':
      return status === 'Concluído' ? 'bg-green-500' : 'bg-purple-500';
    case 'task':
      return status === 'Concluída' ? 'bg-green-500' : 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'lead_created':
      return <UserPlus className="w-4 h-4" />;
    case 'appointment':
      return <Calendar className="w-4 h-4" />;
    case 'follow_up':
      return <MessageSquare className="w-4 h-4" />;
    case 'task':
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export const ViewLeadDetailDialog = ({ 
  open, 
  onOpenChange, 
  lead,
  onLeadUpdated 
}: ViewLeadDetailDialogProps) => {
  const { events, loading: eventsLoading } = useLeadJourney(lead?.id);
  const { closers } = useClosers(open);
  const { columns } = usePipelineColumns();
  const { getLeadTags } = useLeadTagAssignments();
  const { updateLead } = useLeads();

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: '',
    assigned_to: '',
    product_value: 0,
    temperature: '',
    source: '',
    product_name: ''
  });

  const [leadTags, setLeadTags] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('principal');
  const [searchTimeline, setSearchTimeline] = useState('');

  // Atualizar form quando lead muda
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || '',
        assigned_to: lead.assigned_to || '',
        product_value: lead.product_value || 0,
        temperature: lead.temperature || '',
        source: lead.source || '',
        product_name: lead.product_name || ''
      });
      // Use tags from lead if available, otherwise fetch them
      if (lead.tags && lead.tags.length > 0) {
        setLeadTags(lead.tags);
      } else {
        getLeadTags(lead.id).then(tags => setLeadTags(tags));
      }
    }
  }, [lead, getLeadTags]);

  // Salvar alterações
  const handleSave = async () => {
    if (!lead) return;
    
    setIsSaving(true);
    try {
      await updateLead(lead.id, {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        status: formData.status || null,
        assigned_to: formData.assigned_to || null,
        product_value: formData.product_value || null,
        temperature: formData.temperature || null,
        source: formData.source || null,
        product_name: formData.product_name || null
      });
      onLeadUpdated?.();
    } finally {
      setIsSaving(false);
    }
  };

  // Agrupar eventos por data
  const groupedEvents = events.reduce((groups, event) => {
    const dateKey = formatTimelineDate(event.date);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, JourneyEvent[]>);

  // Filtrar eventos
  const filteredGroupedEvents = Object.entries(groupedEvents).reduce((acc, [date, dateEvents]) => {
    const filtered = dateEvents.filter(event => 
      event.title.toLowerCase().includes(searchTimeline.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTimeline.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[date] = filtered;
    }
    return acc;
  }, {} as Record<string, JourneyEvent[]>);

  // Obter cor da coluna atual do status
  const currentColumn = columns.find(col => col.name === formData.status);
  const statusColor = currentColumn?.color || '#6B7280';

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-full h-[100vh] p-0 gap-0 rounded-none border-0 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          {/* Coluna Esquerda - Formulário */}
          <div className="w-[45%] bg-slate-800 text-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-slate-700"
                    onClick={() => onOpenChange(false)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-xl font-semibold">{formData.name || 'Lead'}</h2>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Exportar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Excluir lead</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* ID e Tags */}
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                <span>#{lead.id.slice(0, 8).toUpperCase()}</span>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 h-auto p-0">
                  <Tag className="w-3 h-3 mr-1" />
                  ADICIONAR TAGS
                </Button>
              </div>

              {/* Tags existentes */}
              {leadTags && leadTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {leadTags.map(tag => (
                    <TagBadge 
                      key={tag.id} 
                      name={tag.name}
                      color={tag.color}
                      size="sm"
                    />
                  ))}
                </div>
              )}

              {/* Status Dropdown */}
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger 
                  className="w-full bg-transparent border-0 border-b-4 rounded-none text-white hover:bg-slate-700 px-0"
                  style={{ borderBottomColor: statusColor }}
                >
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(column => (
                    <SelectItem key={column.id} value={column.name}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
                        {column.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <TabsList className="bg-slate-700/50 border-b border-slate-700 rounded-none h-auto p-0 w-full justify-start shrink-0">
                <TabsTrigger value="principal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent text-slate-400 data-[state=active]:text-white px-4 py-3">
                  Principal
                </TabsTrigger>
                <TabsTrigger value="estatisticas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent text-slate-400 data-[state=active]:text-white px-4 py-3">
                  Estatísticas
                </TabsTrigger>
                <TabsTrigger value="midia" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent text-slate-400 data-[state=active]:text-white px-4 py-3">
                  Mídia
                </TabsTrigger>
                <TabsTrigger value="produtos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent text-slate-400 data-[state=active]:text-white px-4 py-3">
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="config" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent text-slate-400 data-[state=active]:text-white px-4 py-3">
                  Configurações
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 min-h-0">
                <TabsContent value="principal" className="p-4 space-y-6 mt-0 h-auto">
                  {/* Formulário Principal */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-400 text-sm">Usuário responsável</Label>
                      <Select 
                        value={formData.assigned_to || 'unassigned'} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value === 'unassigned' ? '' : value }))}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Não atribuído</SelectItem>
                          {closers.map(closer => (
                            <SelectItem key={closer.id} value={closer.id}>
                              {closer.full_name || closer.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-400 text-sm">Venda</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                        <Input 
                          type="number"
                          value={formData.product_value || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, product_value: Number(e.target.value) }))}
                          className="bg-slate-700/50 border-slate-600 text-white pl-10"
                          placeholder="0,00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-400 text-sm">Temperatura</Label>
                      <Select 
                        value={formData.temperature || ''} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, temperature: value }))}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione a temperatura" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Quente">🔥 Quente</SelectItem>
                          <SelectItem value="Morno">🟡 Morno</SelectItem>
                          <SelectItem value="Frio">❄️ Frio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-400 text-sm">Origem</Label>
                      <Input 
                        value={formData.source || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Origem do lead"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-400 text-sm">Produto</Label>
                      <Input 
                        value={formData.product_name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Nome do produto"
                      />
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Seção de Contato */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Contato
                    </h3>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-sm">Nome</Label>
                          <Input 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-sm flex items-center gap-2">
                            <Phone className="w-3 h-3" /> Tel. comercial
                          </Label>
                          <Input 
                            value={formData.phone || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-slate-700/50 border-slate-600 text-white"
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-sm flex items-center gap-2">
                            <Mail className="w-3 h-3" /> E-mail comercial
                          </Label>
                          <Input 
                            value={formData.email || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-slate-700/50 border-slate-600 text-white"
                            placeholder="email@exemplo.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Seção de Empresa */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Empresa
                    </h3>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white">{lead.partner?.name || 'Sem empresa vinculada'}</p>
                        <p className="text-sm text-slate-400">Parceiro</p>
                      </div>
                    </div>
                  </div>

                  {/* Botão Salvar */}
                  <div className="pt-4">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="estatisticas" className="p-4 mt-0">
                  <div className="text-center text-slate-400 py-8">
                    <BarChart2Icon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Estatísticas do lead em breve</p>
                  </div>
                </TabsContent>

                <TabsContent value="midia" className="p-4 mt-0">
                  <div className="text-center text-slate-400 py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Arquivos e mídia em breve</p>
                  </div>
                </TabsContent>

                <TabsContent value="produtos" className="p-4 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                      Produto Associado
                    </h3>
                    {formData.product_name ? (
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <p className="text-white font-medium">{formData.product_name}</p>
                        <p className="text-slate-400 text-sm">
                          Valor: R$ {formData.product_value?.toLocaleString('pt-BR') || '0'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 py-8">
                        <p>Nenhum produto associado</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="config" className="p-4 mt-0">
                  <div className="text-center text-slate-400 py-8">
                    <p>Configurações do lead em breve</p>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Coluna Direita - Timeline */}
          <div className="flex-1 bg-background flex flex-col overflow-hidden">
            {/* Header da Timeline */}
            <div className="p-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar na timeline..."
                    value={searchTimeline}
                    onChange={(e) => setSearchTimeline(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Timeline de Eventos */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-6">
                {eventsLoading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Carregando eventos...
                  </div>
                ) : Object.keys(filteredGroupedEvents).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum evento encontrado
                  </div>
                ) : (
                  Object.entries(filteredGroupedEvents).reverse().map(([date, dateEvents]) => (
                    <div key={date} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{date}</span>
                        <Separator className="flex-1" />
                      </div>
                      
                      <div className="space-y-3">
                        {dateEvents.map(event => (
                          <div 
                            key={event.id} 
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white",
                              getEventBadgeColor(event.type, event.status)
                            )}>
                              {getEventIcon(event.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium text-sm">{event.title}</p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {event.description}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatEventTime(event.time)}
                                </span>
                              </div>
                              {event.status && (
                                <Badge 
                                  variant="secondary" 
                                  className="mt-2 text-xs"
                                >
                                  {event.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer - Tarefas e Input */}
            <div className="border-t p-4 space-y-3 shrink-0">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Nenhuma tarefa planejada, comece adicionando uma</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <User className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">1</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Adicionar uma nota..."
                  className="flex-1"
                />
                <Button size="icon" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper icon component
const BarChart2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
