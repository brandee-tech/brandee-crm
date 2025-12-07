import { useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePartners } from '@/hooks/usePartners';
import { useLeadTags } from '@/hooks/useLeadTags';
import { TagBadge } from '@/components/TagBadge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check } from 'lucide-react';

export interface PipelineFilterState {
  searchTerm: string;
  temperature: string;
  partner_id: string;
  tags: string[];
  dateRange: { from: string; to: string };
}

interface PipelineFiltersProps {
  filters: PipelineFilterState;
  onFiltersChange: (filters: PipelineFilterState) => void;
}

export const PipelineFilters = ({ filters, onFiltersChange }: PipelineFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const { partners } = usePartners();
  const { tags } = useLeadTags();

  const updateFilter = (key: keyof PipelineFilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      temperature: 'todos',
      partner_id: 'todos',
      tags: [],
      dateRange: { from: '', to: '' }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.temperature !== 'todos') count++;
    if (filters.partner_id !== 'todos') count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  const handleTagSelect = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(id => id !== tagId)
      : [...filters.tags, tagId];
    updateFilter('tags', newTags);
  };

  const handleTagRemove = (tagId: string) => {
    updateFilter('tags', filters.tags.filter(id => id !== tagId));
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Barra de busca sempre visível */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Botão de filtros avançados */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro por Temperatura */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Temperatura
              </label>
              <Select
                value={filters.temperature}
                onValueChange={(value) => updateFilter('temperature', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as temperaturas</SelectItem>
                  <SelectItem value="Quente">🔥 Quente</SelectItem>
                  <SelectItem value="Morno">🟡 Morno</SelectItem>
                  <SelectItem value="Frio">❄️ Frio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Parceiro */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Parceiro
              </label>
              <Select
                value={filters.partner_id}
                onValueChange={(value) => updateFilter('partner_id', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os parceiros</SelectItem>
                  {partners
                    .filter(partner => partner.status === 'ativo')
                    .map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tags
              </label>
              <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={tagsOpen}
                    className="w-full justify-between h-auto min-h-10"
                  >
                    <div className="flex flex-wrap gap-1 flex-1">
                      {filters.tags.length === 0 ? (
                        <span className="text-muted-foreground">Selecionar tags...</span>
                      ) : (
                        filters.tags.map(tagId => {
                          const tag = tags.find(t => t.id === tagId);
                          return tag ? (
                            <TagBadge
                              key={tag.id}
                              name={tag.name}
                              color={tag.color}
                              size="sm"
                              onRemove={() => handleTagRemove(tag.id)}
                            />
                          ) : null;
                        })
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar tags..." />
                    <CommandList className="max-h-60">
                      <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                      <CommandGroup>
                        {tags.map((tag) => (
                          <CommandItem
                            key={tag.id}
                            value={tag.name}
                            onSelect={() => handleTagSelect(tag.id)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                filters.tags.includes(tag.id) ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <TagBadge name={tag.name} color={tag.color} size="sm" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro por Data de Cadastro */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Data de cadastro
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, from: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, to: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros ativos */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Busca: {filters.searchTerm}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('searchTerm', '')}
                  />
                </Badge>
              )}
              {filters.temperature !== 'todos' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Temperatura: {filters.temperature}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('temperature', 'todos')}
                  />
                </Badge>
              )}
               {filters.partner_id !== 'todos' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Parceiro: {partners.find(p => p.id === filters.partner_id)?.name || 'Desconhecido'}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('partner_id', 'todos')}
                  />
                </Badge>
              )}
              {filters.tags && filters.tags.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Tags ({filters.tags.length})
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('tags', [])}
                  />
                </Badge>
              )}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {filters.dateRange.from && filters.dateRange.to 
                    ? `${filters.dateRange.from} - ${filters.dateRange.to}`
                    : filters.dateRange.from 
                    ? `A partir de ${filters.dateRange.from}`
                    : `Até ${filters.dateRange.to}`
                  }
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('dateRange', { from: '', to: '' })}
                  />
                </Badge>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};