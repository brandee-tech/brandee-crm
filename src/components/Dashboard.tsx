
import { 
  TrendingUp, 
  Users, 
  CheckSquare,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Percent
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDashboard } from '@/hooks/useDashboard';

export const Dashboard = () => {
  const { stats, loading } = useDashboard();

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const metrics = [
    {
      title: 'Total de Leads',
      value: stats.totalLeads.toString(),
      change: formatPercentage(stats.trendsData.leadsChange),
      trend: stats.trendsData.leadsChange >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Total de Contatos',
      value: stats.totalContacts.toString(),
      change: formatPercentage(stats.trendsData.contactsChange),
      trend: stats.trendsData.contactsChange >= 0 ? 'up' : 'down',
      icon: Users,
      color: 'text-orange-600'
    },
    {
      title: 'Total de Tarefas',
      value: stats.totalTasks.toString(),
      change: formatPercentage(stats.trendsData.tasksChange),
      trend: stats.trendsData.tasksChange >= 0 ? 'up' : 'down',
      icon: CheckSquare,
      color: 'text-green-600'
    },
    {
      title: 'Agendamentos',
      value: stats.totalAppointments.toString(),
      change: formatPercentage(stats.trendsData.appointmentsChange),
      trend: stats.trendsData.appointmentsChange >= 0 ? 'up' : 'down',
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  const kpis = [
    {
      title: 'Taxa de Conversão',
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: 'Total no Pipeline',
      value: stats.totalPipelineValue.toString(),
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Leads Qualificados',
      value: (stats.leadsByStatus['Quente'] || 0).toString(),
      icon: Percent,
      color: 'text-orange-600'
    },
    {
      title: 'Leads Ativos',
      value: ((stats.leadsByStatus['Quente'] || 0) + (stats.leadsByStatus['Morno'] || 0)).toString(),
      icon: Users,
      color: 'text-blue-600'
    }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <div className="flex justify-between items-center px-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Último update</p>
          <p className="text-lg font-semibold text-gray-900">Agora mesmo</p>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                <p className="text-gray-600 text-sm mt-1">{metric.title}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.color} bg-opacity-10`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-sm text-gray-600">{kpi.title}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8">
        {/* Status das Tarefas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status das Tarefas</h3>
          <div className="space-y-4">
            {Object.entries(stats.tasksByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                  <span className="text-sm text-gray-500">{count} tarefas</span>
                </div>
                <Progress value={stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Status dos Leads */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status dos Leads</h3>
          <div className="space-y-4">
            {Object.entries(stats.leadsByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                  <span className="text-sm text-gray-500">{count} leads</span>
                </div>
                <Progress value={stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Leads Recentes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Leads Recentes</h3>
          <div className="space-y-4">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.email || 'Sem email'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      lead.status === 'Quente' 
                        ? 'bg-red-100 text-red-700'
                        : lead.status === 'Morno'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum lead recente</p>
            )}
          </div>
        </Card>
      </div>

      {/* Status dos Agendamentos */}
      {Object.keys(stats.appointmentsByStatus).length > 0 && (
        <Card className="p-6 mx-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status dos Agendamentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.appointmentsByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{status}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
