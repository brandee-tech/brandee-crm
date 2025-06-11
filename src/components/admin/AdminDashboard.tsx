
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSaasMetrics } from '@/hooks/useSaasMetrics';
import { Building2, Users, TrendingUp, UserPlus } from 'lucide-react';

export const AdminDashboard = () => {
  const { metrics, loading } = useSaasMetrics();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando métricas...</div>
      </div>
    );
  }

  const planColors: Record<string, string> = {
    basic: 'bg-gray-100 text-gray-800',
    premium: 'bg-blue-100 text-blue-800',
    enterprise: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard SaaS</h1>
        <p className="text-gray-600 mt-2">Visão geral do sistema e métricas globais</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_companies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Empresas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Usuários ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.active_companies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.new_users_this_month || 0}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Empresas por Plano */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas por Plano</CardTitle>
          <CardDescription>
            Distribuição das empresas pelos diferentes planos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {metrics?.companies_by_plan && Object.entries(metrics.companies_by_plan).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[plan] || 'bg-gray-100 text-gray-800'}`}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </span>
                </div>
                <div className="text-2xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento</CardTitle>
            <CardDescription>Métricas de crescimento mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Novas empresas este mês</span>
                <span className="font-semibold">{metrics?.active_companies || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Novos usuários este mês</span>
                <span className="font-semibold">{metrics?.new_users_this_month || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Informações gerais do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sistema</span>
                <span className="text-green-600 font-semibold">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Última atualização</span>
                <span className="font-semibold">Hoje</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
