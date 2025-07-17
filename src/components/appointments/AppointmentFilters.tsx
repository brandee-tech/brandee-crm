import { useState } from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AppointmentFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  closer: string;
}

interface AppointmentFiltersProps {
  filters: AppointmentFilters;
  onFiltersChange: (filters: AppointmentFilters) => void;
  closers: Array<{ id: string; name: string }>;
  resultsCount: number;
}

export const AppointmentFiltersComponent = ({ 
  filters, 
  onFiltersChange, 
  closers,
  resultsCount 
}: AppointmentFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilter = (key: keyof AppointmentFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      closer: ''
    });
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome do lead, título do agendamento ou telefone..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2 text-muted-foreground"
              >
                <X className="w-4 h-4" />
                Limpar
              </Button>
            )}
          </div>

          <Badge variant="secondary" className="text-sm">
            {resultsCount} resultado{resultsCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="Scheduled">Agendado</SelectItem>
                    <SelectItem value="Confirmed">Confirmado</SelectItem>
                    <SelectItem value="Completed">Realizado</SelectItem>
                    <SelectItem value="Cancelled">Cancelado</SelectItem>
                    <SelectItem value="No Show">No Show</SelectItem>
                    <SelectItem value="Rescheduled">Reagendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Closer Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Responsável</label>
                <Select value={filters.closer} onValueChange={(value) => updateFilter('closer', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os responsáveis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os responsáveis</SelectItem>
                    {closers.map((closer) => (
                      <SelectItem key={closer.id} value={closer.id}>
                        {closer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};