import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSaasAnalytics, type AnalyticsFilters } from '@/hooks/useSaasAnalytics';
import { AnalyticsFiltersComponent as FiltersComponent } from './AnalyticsFilters';
import { AnalyticsOverview } from './AnalyticsOverview';
import { CompaniesAnalytics } from './CompaniesAnalytics';
import { UsersAnalytics } from './UsersAnalytics';
import { ActivitiesAnalytics } from './ActivitiesAnalytics';
import { PerformanceAnalytics } from './PerformanceAnalytics';

export const SaasAnalytics = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({ period_days: 30 });
  const { analytics, loading } = useSaasAnalytics(filters);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Dados não disponíveis</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics SaaS</h1>
        <p className="text-gray-600 mt-2">Análise detalhada do desempenho do sistema</p>
      </div>

      <FiltersComponent filters={filters} onFiltersChange={setFilters} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AnalyticsOverview data={analytics} />
        </TabsContent>

        <TabsContent value="companies">
          <CompaniesAnalytics data={analytics.companies} />
        </TabsContent>

        <TabsContent value="users">
          <UsersAnalytics data={analytics.users} />
        </TabsContent>

        <TabsContent value="activities">
          <ActivitiesAnalytics data={analytics.activities} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceAnalytics data={analytics.top_companies} />
        </TabsContent>
      </Tabs>
    </div>
  );
};