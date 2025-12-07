import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { useRevenue } from '@/hooks/useRevenue';
import { GoalsWidget } from '@/components/dashboard/GoalsWidget';
import { useClosers } from '@/hooks/useClosers';
import { StatCard } from '@/components/ui/stat-card';
import { PageLoader } from '@/components/ui/page-loader';
import { SkeletonListItem } from '@/components/ui/skeleton-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Calendar, CheckCircle, TrendingUp, Clock, Target, User, MessageSquare, DollarSign, TrendingDown, Filter, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const Dashboard = () => {
  const { user } = useAuth();
  const { userInfo } = useCurrentUser();
  const [selectedCloser, setSelectedCloser] = useState<string>('');
  const { stats, loading } = useDashboard(selectedCloser || undefined);
  const { metrics: revenueMetrics, loading: revenueLoading } = useRevenue();
  const { closers, loading: closersLoading } = useClosers();

  const isNewCompany = stats.totalLeads === 0 && stats.totalAppointments === 0 && stats.totalTasks === 0;

  const {
    totalLeads = 0,
    totalAppointments = 0,
    conversionRate = 0,
    totalTasks = 0
  } = stats;

  const completedAppointments = stats.appointmentsByStatus?.['Realizado'] || 0;
  const todayAppointments = 0;
  const pendingTasks = stats.tasksByStatus?.['Pendente'] || 0;

  const dashboardStats = [
    {
      title: 'Total de Leads',
      value: totalLeads,
      icon: Users,
      description: 'Leads cadastrados',
      variant: 'primary' as const
    },
    {
      title: 'Agendamentos',
      value: totalAppointments,
      icon: Calendar,
      description: 'Total de agendamentos',
      variant: 'success' as const
    },
    {
      title: 'Realizados',
      value: completedAppointments,
      icon: CheckCircle,
      description: 'Agendamentos concluídos',
      variant: 'info' as const
    },
    {
      title: 'Taxa de Conversão',
      value: conversionRate,
      icon: TrendingUp,
      description: 'Taxa de conversão (30 dias)',
      variant: 'warning' as const,
      suffix: '%',
      decimals: 1
    },
    {
      title: 'Hoje',
      value: todayAppointments,
      icon: Clock,
      description: 'Agendamentos hoje',
      variant: 'primary' as const
    },
    {
      title: 'Tarefas Pendentes',
      value: pendingTasks,
      icon: Target,
      description: 'Tarefas em aberto',
      variant: 'destructive' as const
    },
    {
      title: 'Receita Total',
      value: revenueLoading ? 0 : revenueMetrics.totalRevenue,
      icon: DollarSign,
      description: 'Receita gerada',
      variant: 'success' as const,
      prefix: 'R$ ',
      decimals: 2
    },
    {
      title: 'Receita Perdida',
      value: revenueLoading ? 0 : revenueMetrics.totalLost,
      icon: TrendingDown,
      description: 'Receita perdida',
      variant: 'destructive' as const,
      prefix: 'R$ ',
      decimals: 2
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <PageLoader text="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <div className="flex-1 min-w-0 opacity-0 animate-fade-in animation-fill-both">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            {selectedCloser && (
              <span className="text-lg text-primary font-medium">
                - {closers.find(c => c.id === selectedCloser)?.full_name}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-warning" />
            Bem-vindo de volta, {userInfo?.full_name || user?.email?.split('@')[0]}!
            {userInfo?.company_name && (
              <span className="text-xs text-muted-foreground/70">
                • {userInfo.company_name}
              </span>
            )}
          </p>
        </div>
        
        {userInfo?.role_name === 'Admin' && (
          <div className="flex items-center gap-2 opacity-0 animate-fade-in animation-fill-both animation-delay-200">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCloser} onValueChange={setSelectedCloser}>
              <SelectTrigger className="w-48 bg-card border-border">
                <SelectValue placeholder="Todos os closers" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="">Todos os closers</SelectItem>
                {closers.map((closer) => (
                  <SelectItem key={closer.id} value={closer.id}>
                    {closer.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            variant={stat.variant}
            index={index}
            prefix={stat.prefix}
            suffix={stat.suffix}
            decimals={stat.decimals}
          />
        ))}
      </div>

      {/* Main Content */}
      {isNewCompany ? (
        <WelcomeMessage />
      ) : (
        <>
          {userInfo?.role_name === 'Closer' && (
            <div className="mb-6 opacity-0 animate-fade-in-up animation-fill-both animation-delay-500">
              <GoalsWidget />
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Upcoming Appointments */}
            <Card className="opacity-0 animate-fade-in-up animation-fill-both animation-delay-600 overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Próximos Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <SkeletonListItem key={i} className="px-4" />
                    ))
                  ) : stats.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
                    stats.upcomingAppointments.map((appointment: any, index: number) => (
                      <div 
                        key={appointment.id} 
                        className={cn(
                          "flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer group",
                          "opacity-0 animate-fade-in animation-fill-both"
                        )}
                        style={{ animationDelay: `${(index + 7) * 100}ms` }}
                      >
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {appointment.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {format(new Date(`${appointment.date}T${appointment.time}`), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </span>
                            {appointment.leads?.name && (
                              <>
                                <span className="text-border">•</span>
                                <span className="truncate">{appointment.leads.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground">Nenhum agendamento próximo</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="opacity-0 animate-fade-in-up animation-fill-both animation-delay-700 overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <SkeletonListItem key={i} className="px-4" />
                    ))
                  ) : stats.recentActivities && stats.recentActivities.length > 0 ? (
                    stats.recentActivities.map((activity: any, index: number) => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'lead': return User;
                          case 'appointment': return Calendar;
                          default: return MessageSquare;
                        }
                      };
                      
                      const getActivityColor = (type: string) => {
                        switch (type) {
                          case 'lead': return 'bg-success/10 text-success';
                          case 'appointment': return 'bg-primary/10 text-primary';
                          default: return 'bg-muted text-muted-foreground';
                        }
                      };

                      const ActivityIcon = getActivityIcon(activity.type);
                      
                      return (
                        <div 
                          key={index} 
                          className={cn(
                            "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors group",
                            "opacity-0 animate-fade-in animation-fill-both"
                          )}
                          style={{ animationDelay: `${(index + 8) * 100}ms` }}
                        >
                          <div className="flex-shrink-0">
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110",
                              getActivityColor(activity.type)
                            )}>
                              <ActivityIcon className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {activity.title}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground truncate">
                                {activity.description}
                              </p>
                              <span className="text-xs text-muted-foreground/70 flex-shrink-0">
                                {format(new Date(activity.time), "dd/MM HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <Target className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground">Nenhuma atividade recente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
