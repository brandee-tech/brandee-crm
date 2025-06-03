
import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface LeadFilterState {
  searchTerm: string;
  status: string;
  source: string;
  valueRange: { min: string; max: string };
  dateRange: { from: string; to: string };
}

interface LeadFiltersProps {
  onFiltersChange: (filters: LeadFilterState) => void;
  totalLeads: number;
  filteredCount: number;
}

export const LeadFilters = ({ onFiltersChange, totalLeads, filteredCount }: LeadFiltersProps) => {
  const [filters, setFilters] = useState<LeadFilterState>({
    searchTerm: '',
    status: 'todos',
    source: 'todas',
    valueRange: { min: '', max: '' },
    dateRange: { from: '', to: '' }
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (newFilters: Partial<LeadFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: LeadFilterState = {
      searchTerm: '',
      status: 'todos',
      source: 'todas',
      valueRange: { min: '', max: '' },
      dateRange: { from: '', to: '' }
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status !== 'todos') count++;
    if (filters.source !== 'todas') count++;
    if (filters.valueRange.min || filters.valueRange.max) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os status</option>
              <option value="Quente">Quente</option>
              <option value="Morno">Morno</option>
              <option value="Frio">Frio</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Origem</label>
            <select
              value={filters.source}
              onChange={(e) => updateFilters({ source: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas as origens</option>
              <option value="Website">Website</option>
              <option value="Indicação">Indicação</option>
              <option value="Redes Sociais">Redes Sociais</option>
              <option value="Telemarketing">Telemarketing</option>
              <option value="Evento">Evento</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Valor (R$)</label>
            <div className="flex gap-2">
              <Input
                placeholder="Min"
                type="number"
                value={filters.valueRange.min}
                onChange={(e) => updateFilters({ 
                  valueRange: { ...filters.valueRange, min: e.target.value }
                })}
              />
              <Input
                placeholder="Max"
                type="number"
                value={filters.valueRange.max}
                onChange={(e) => updateFilters({ 
                  valueRange: { ...filters.valueRange, max: e.target.value }
                })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Período</label>
            <div className="space-y-2">
              <Input
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => updateFilters({ 
                  dateRange: { ...filters.dateRange, from: e.target.value }
                })}
                placeholder="Data inicial"
              />
              <Input
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => updateFilters({ 
                  dateRange: { ...filters.dateRange, to: e.target.value }
                })}
                placeholder="Data final"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Mostrando {filteredCount} de {totalLeads} leads
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-blue-600">
            {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Card>
  );
};
