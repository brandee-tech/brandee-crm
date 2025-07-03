import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import type { AnalyticsFilters } from '@/hooks/useSaasAnalytics';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

export const AnalyticsFiltersComponent = ({ filters, onFiltersChange }: AnalyticsFiltersProps) => {
  const { companies } = useAllCompanies();

  const periodOptions = [
    { value: 7, label: 'Últimos 7 dias' },
    { value: 30, label: 'Últimos 30 dias' },
    { value: 90, label: 'Últimos 3 meses' },
    { value: 180, label: 'Últimos 6 meses' },
    { value: 365, label: 'Último ano' }
  ];

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border">
      <div className="space-y-2">
        <Label htmlFor="period">Período</Label>
        <Select 
          value={filters.period_days.toString()} 
          onValueChange={(value) => onFiltersChange({ ...filters, period_days: parseInt(value) })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map(option => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Empresa (Opcional)</Label>
        <Select 
          value={filters.company_filter || 'all'} 
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            company_filter: value === 'all' ? undefined : value 
          })}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};