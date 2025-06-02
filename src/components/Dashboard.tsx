
import { 
  TrendingUp, 
  Users, 
  Building2, 
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDashboard } from '@/hooks/useDashboard';

export const Dashboard = () => {
  const { stats, loading } = useDashboard();

  const metrics = [
    {
      title: 'Total de Leads',
      value: stats.totalLeads.toString(),
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Total de Contatos',
      value: stats.totalContacts.toString(),
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600'
    },
    {
      title: 'Total de Empresas',
      value: stats.totalCompanies.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: Building2,
      color: 'text-purple-600'
    },
    {
      title: 'Total de Tarefas',
      value: stats.totalTasks.toString(),
      change: '-2.1%',
      trend: 'down',
      icon: CheckSquare,
      color: 'text-green-600'
    }
  ];

  const formatValue = (value: number | null) => {
    if (!value) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline de Tarefas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status das Tarefas</h3>
          <div className="space-y-4">
            {Object.entries(stats.tasksByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                  <span className="text-sm text-gray-500">{count} tarefas</span>
                </div>
                <Progress value={(count / stats.totalTasks) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Leads Recentes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Leads Recentes</h3>
          <div className="space-y-4">
            {stats.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.company}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatValue(lead.value)}</p>
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
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
