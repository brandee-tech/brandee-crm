
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { RealtimeBadge } from '@/components/ui/realtime-badge';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CheckCircle, TrendingUp, Clock, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const Dashboard = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboard();

  // Extract stats with safe defaults
  const {
    totalLeads = 0,
    totalAppointments = 0,
    conversionRate = 0,
    totalTasks = 0
  } = stats;

  // Calculate derived metrics
  const completedAppointments = stats.appointmentsByStatus?.['Realizado'] || 0;
  const todayAppointments = 0; // This would need to be calculated from appointments data
  const pendingTasks = stats.tasksByStatus?.['Pendente'] || 0;

  const dashboardStats = [
    {
      title: 'Total de Leads',
      value: totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Leads cadastrados'
    },
    {
      title: 'Agendamentos',
      value: totalAppointments,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Total de agendamentos'
    },
    {
      title: 'Realizados',
      value: completedAppointments,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Agendamentos concluídos'
    },
    {
      title: 'Taxa de Conversão',
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Taxa de fechamento'
    },
    {
      title: 'Hoje',
      value: todayAppointments,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Agendamentos hoje'
    },
    {
      title: 'Tarefas Pendentes',
      value: pendingTasks,
      icon: Target,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Tarefas em aberto'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <LoadingIndicator className="py-16" text="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Bem-vindo de volta, {user?.email?.split('@')[0]}!
          </p>
        </div>
        
        <RealtimeBadge isUpdating={false} />
      </div>

      {/* Grid de KPIs - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
              )}
              <p className="text-xs text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seções Principais - Layout Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Agendamentos Recentes */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum agendamento próximo</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
