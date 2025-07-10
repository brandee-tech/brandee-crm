
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Download, Calendar, ArrowUpRight, ArrowDownRight, Users, Clock, FileDown, Target, Trophy } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useMeetingsAndAppointmentsReports, PeriodType } from '@/hooks/useMeetingsAndAppointmentsReports';
import { useCloserReports, useClosersComparison } from '@/hooks/useCloserReports';
import { useClosers } from '@/hooks/useClosers';
import { SalesChart } from '@/components/charts/SalesChart';
import { PipelineChart } from '@/components/charts/PipelineChart';
import { ActivitiesChart } from '@/components/charts/ActivitiesChart';
import { MeetingsReportChart } from '@/components/charts/MeetingsReportChart';
import { AppointmentsReportChart } from '@/components/charts/AppointmentsReportChart';
import { PeriodSelector } from '@/components/PeriodSelector';

export const Reports = () => {
  const { reportData, isLoading } = useReports();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  const [selectedCloser, setSelectedCloser] = useState<string>('');
  const [periodDays, setPeriodDays] = useState(30);
  
  const { reportData: meetingsAppointmentsData, isLoading: isLoadingMeetingsAppointments } = useMeetingsAndAppointmentsReports(selectedPeriod);
  const { closers, loading: closersLoading } = useClosers();
  const { reportData: closerReportData, isLoading: isLoadingCloserReport } = useCloserReports(selectedCloser, periodDays);
  const { comparisonData, isLoading: isLoadingComparison } = useClosersComparison(periodDays);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Função utilitária para converter dados em CSV
  const convertToCSV = (data: any[], headers: { [key: string]: string }) => {
    const headerRow = Object.values(headers).join(',');
    const dataRows = data.map(row => {
      return Object.keys(headers).map(key => {
        const value = row[key];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',');
    });
    return [headerRow, ...dataRows].join('\n');
  };

  // Função para fazer download do CSV
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Funções específicas de exportação
  const exportSalesData = () => {
    if (!reportData) return;
    
    const headers = {
      month: 'Mês',
      value: 'Valor (R$)',
      count: 'Quantidade de Vendas'
    };
    
    const csvContent = convertToCSV(reportData.salesByMonth, headers);
    downloadCSV(csvContent, 'vendas-por-periodo');
  };

  const exportMeetingsData = () => {
    if (!meetingsAppointmentsData) return;
    
    const headers = {
      period: 'Período',
      count: 'Total',
      completed: 'Finalizadas',
      scheduled: 'Agendadas',
      inProgress: 'Em Andamento'
    };
    
    const csvContent = convertToCSV(meetingsAppointmentsData.meetingsByPeriod, headers);
    downloadCSV(csvContent, `reunioes-${selectedPeriod}`);
  };

  const exportAppointmentsData = () => {
    if (!meetingsAppointmentsData) return;
    
    const headers = {
      period: 'Período',
      count: 'Total',
      scheduled: 'Agendados',
      completed: 'Realizados',
      cancelled: 'Cancelados'
    };
    
    const csvContent = convertToCSV(meetingsAppointmentsData.appointmentsByPeriod, headers);
    downloadCSV(csvContent, `agendamentos-${selectedPeriod}`);
  };

  const exportLeadsData = () => {
    if (!reportData) return;
    
    const headers = {
      source: 'Fonte',
      count: 'Quantidade'
    };
    
    const csvContent = convertToCSV(reportData.leadsBySource, headers);
    downloadCSV(csvContent, 'leads-por-fonte');
  };

  const exportPipelineData = () => {
    if (!reportData) return;
    
    const headers = {
      status: 'Status',
      value: 'Valor (R$)',
      count: 'Quantidade'
    };
    
    const csvContent = convertToCSV(reportData.pipelineData, headers);
    downloadCSV(csvContent, 'pipeline-vendas');
  };

  const exportKPIsData = () => {
    if (!reportData || !meetingsAppointmentsData) return;
    
    const kpiData = [
      {
        metrica: 'Taxa de Conversão',
        valor: `${reportData.conversionRate.toFixed(1)}%`,
        categoria: 'Vendas'
      },
      {
        metrica: 'Ticket Médio',
        valor: formatCurrency(reportData.avgDealValue),
        categoria: 'Vendas'
      },
      {
        metrica: 'Leads Qualificados',
        valor: reportData.qualifiedLeads.toString(),
        categoria: 'Vendas'
      },
      {
        metrica: 'Ciclo de Vendas',
        valor: `${Math.round(reportData.avgSalesCycle)} dias`,
        categoria: 'Vendas'
      },
      {
        metrica: 'Total de Reuniões',
        valor: meetingsAppointmentsData.totalMeetings.toString(),
        categoria: 'Atendimento'
      },
      {
        metrica: 'Taxa de Conclusão Reuniões',
        valor: `${meetingsAppointmentsData.meetingCompletionRate.toFixed(1)}%`,
        categoria: 'Atendimento'
      },
      {
        metrica: 'Total de Agendamentos',
        valor: meetingsAppointmentsData.totalAppointments.toString(),
        categoria: 'Atendimento'
      },
      {
        metrica: 'Taxa de Comparecimento',
        valor: `${meetingsAppointmentsData.appointmentShowRate.toFixed(1)}%`,
        categoria: 'Atendimento'
      }
    ];
    
    const headers = {
      metrica: 'Métrica',
      valor: 'Valor',
      categoria: 'Categoria'
    };
    
    const csvContent = convertToCSV(kpiData, headers);
    downloadCSV(csvContent, 'kpis-gerais');
  };

  const exportActivitiesData = () => {
    if (!reportData) return;
    
    const headers = {
      month: 'Mês',
      tasks: 'Tarefas',
      appointments: 'Agendamentos'
    };
    
    const csvContent = convertToCSV(reportData.activitiesByMonth, headers);
    downloadCSV(csvContent, 'atividades-mensais');
  };

  // Funções de exportação por closer
  const exportCloserReportData = () => {
    if (!closerReportData) return;
    
    const reportDataForCSV = [
      {
        metrica: 'Total de Leads',
        valor: closerReportData.totalLeads.toString()
      },
      {
        metrica: 'Leads Convertidos',
        valor: closerReportData.convertedLeads.toString()
      },
      {
        metrica: 'Taxa de Conversão',
        valor: `${closerReportData.conversionRate.toFixed(1)}%`
      },
      {
        metrica: 'Receita Total',
        valor: formatCurrency(closerReportData.totalRevenue)
      },
      {
        metrica: 'Ticket Médio',
        valor: formatCurrency(closerReportData.avgDealValue)
      },
      {
        metrica: 'Total de Agendamentos',
        valor: closerReportData.totalAppointments.toString()
      },
      {
        metrica: 'Taxa de Conclusão Agendamentos',
        valor: `${closerReportData.appointmentCompletionRate.toFixed(1)}%`
      },
      {
        metrica: 'Tarefas Ativas',
        valor: closerReportData.activeTasks.toString()
      },
      {
        metrica: 'Tarefas Concluídas',
        valor: closerReportData.completedTasks.toString()
      }
    ];
    
    const headers = {
      metrica: 'Métrica',
      valor: 'Valor'
    };
    
    const csvContent = convertToCSV(reportDataForCSV, headers);
    downloadCSV(csvContent, `relatorio-${closerReportData.closerName.replace(/\s+/g, '-').toLowerCase()}`);
  };

  const exportClosersComparisonData = () => {
    if (!comparisonData) return;
    
    const headers = {
      name: 'Closer',
      leads: 'Total Leads',
      conversions: 'Conversões',
      conversionRate: 'Taxa Conversão (%)',
      revenue: 'Receita (R$)',
      appointments: 'Agendamentos'
    };
    
    const csvContent = convertToCSV(comparisonData.closers, headers);
    downloadCSV(csvContent, 'comparativo-closers');
  };

  const exportCloserGoalsData = () => {
    if (!closerReportData?.goals) return;
    
    const goalsData = Object.entries(closerReportData.goals)
      .filter(([_, goal]) => goal !== null)
      .map(([type, goal]) => ({
        tipo: type === 'vendas' ? 'Vendas' : type === 'receita' ? 'Receita' : 'Agendamentos',
        meta: goal?.target || 0,
        atual: goal?.current || 0,
        progresso: `${(goal?.progress || 0).toFixed(1)}%`,
        status: (goal?.progress || 0) >= 100 ? 'Concluída' : 'Em Andamento'
      }));
    
    const headers = {
      tipo: 'Tipo de Meta',
      meta: 'Meta',
      atual: 'Atual',
      progresso: 'Progresso',
      status: 'Status'
    };
    
    const csvContent = convertToCSV(goalsData, headers);
    downloadCSV(csvContent, `metas-${closerReportData.closerName.replace(/\s+/g, '-').toLowerCase()}`);
  };

  if (isLoading || isLoadingMeetingsAppointments) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando relatórios...</div>
      </div>
    );
  }

  if (!reportData || !meetingsAppointmentsData) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg text-gray-500">Erro ao carregar dados dos relatórios</div>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Taxa de Conversão', 
      value: `${reportData.conversionRate.toFixed(1)}%`, 
      trend: formatPercentage(reportData.trendsData.conversionChange),
      trendDirection: reportData.trendsData.conversionChange >= 0 ? 'up' : 'down'
    },
    { 
      label: 'Ticket Médio', 
      value: formatCurrency(reportData.avgDealValue), 
      trend: '+R$ 1.250',
      trendDirection: 'up'
    },
    { 
      label: 'Leads Qualificados', 
      value: reportData.qualifiedLeads.toString(), 
      trend: formatPercentage(reportData.trendsData.leadsChange),
      trendDirection: reportData.trendsData.leadsChange >= 0 ? 'up' : 'down'
    },
    { 
      label: 'Ciclo de Vendas', 
      value: `${Math.round(reportData.avgSalesCycle)} dias`, 
      trend: '-1.5 dias',
      trendDirection: 'up'
    }
  ];

  const meetingsAppointmentsKpis = [
    {
      label: 'Total de Reuniões',
      value: meetingsAppointmentsData.totalMeetings.toString(),
      trend: formatPercentage(meetingsAppointmentsData.trendsData.meetingsChange),
      trendDirection: meetingsAppointmentsData.trendsData.meetingsChange >= 0 ? 'up' : 'down',
      icon: Users
    },
    {
      label: 'Taxa de Conclusão',
      value: `${meetingsAppointmentsData.meetingCompletionRate.toFixed(1)}%`,
      trend: '+2.3%',
      trendDirection: 'up',
      icon: TrendingUp
    },
    {
      label: 'Total de Agendamentos',
      value: meetingsAppointmentsData.totalAppointments.toString(),
      trend: formatPercentage(meetingsAppointmentsData.trendsData.appointmentsChange),
      trendDirection: meetingsAppointmentsData.trendsData.appointmentsChange >= 0 ? 'up' : 'down',
      icon: Calendar
    },
    {
      label: 'Taxa de Comparecimento',
      value: `${meetingsAppointmentsData.appointmentShowRate.toFixed(1)}%`,
      trend: '+1.8%',
      trendDirection: 'up',
      icon: Clock
    }
  ];

  // Dados para os botões de exportação
  const exportOptions = [
    {
      title: 'Exportar KPIs Gerais',
      description: 'Métricas principais de vendas e atendimento',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
      action: exportKPIsData
    },
    {
      title: 'Exportar Vendas',
      description: 'Dados de vendas por período',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      action: exportSalesData
    },
    {
      title: 'Exportar Reuniões',
      description: `Dados de reuniões por ${selectedPeriod === 'daily' ? 'dia' : selectedPeriod === 'weekly' ? 'semana' : selectedPeriod === 'monthly' ? 'mês' : 'ano'}`,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      action: exportMeetingsData
    },
    {
      title: 'Exportar Agendamentos',
      description: `Dados de agendamentos por ${selectedPeriod === 'daily' ? 'dia' : selectedPeriod === 'weekly' ? 'semana' : selectedPeriod === 'monthly' ? 'mês' : 'ano'}`,
      icon: Calendar,
      color: 'bg-orange-100 text-orange-600',
      action: exportAppointmentsData
    },
    {
      title: 'Exportar Pipeline',
      description: 'Distribuição de leads por status',
      icon: BarChart3,
      color: 'bg-indigo-100 text-indigo-600',
      action: exportPipelineData
    },
    {
      title: 'Exportar Leads por Fonte',
      description: 'Distribuição de leads por origem',
      icon: Users,
      color: 'bg-pink-100 text-pink-600',
      action: exportLeadsData
    },
    {
      title: 'Exportar Atividades',
      description: 'Tarefas e agendamentos mensais',
      icon: Calendar,
      color: 'bg-teal-100 text-teal-600',
      action: exportActivitiesData
    }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises e métricas do seu negócio</p>
        </div>
        <div className="flex gap-4 items-center">
          <PeriodSelector 
            selectedPeriod={selectedPeriod} 
            onPeriodChange={setSelectedPeriod} 
          />
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="geral">Relatórios Gerais</TabsTrigger>
          <TabsTrigger value="closers">Relatórios por Closer</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          {/* KPIs Principais de Vendas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => (
              <Card key={index} className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <div className={`flex items-center justify-center gap-1 text-sm mt-1 ${
                    kpi.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.trendDirection === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {kpi.trend} vs período anterior
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Seção de Relatórios de Reuniões e Agendamentos */}
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Relatórios de Atendimentos e Agendamentos</h2>
              
              {/* KPIs de Reuniões e Agendamentos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {meetingsAppointmentsKpis.map((kpi, index) => {
                  const Icon = kpi.icon;
                  return (
                    <Card key={index} className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-8 h-8 text-blue-600" />
                        <div className={`flex items-center gap-1 text-sm ${
                          kpi.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {kpi.trendDirection === 'up' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {kpi.trend}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{kpi.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    </Card>
                  );
                })}
              </div>

              {/* Gráficos de Reuniões e Agendamentos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reuniões por Período</h3>
                  <MeetingsReportChart data={meetingsAppointmentsData.meetingsByPeriod} />
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendamentos por Período</h3>
                  <AppointmentsReportChart data={meetingsAppointmentsData.appointmentsByPeriod} />
                </Card>
              </div>

              {/* Métricas Detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reuniões - Distribuição</h3>
                  <div className="space-y-2">
                    {meetingsAppointmentsData.meetingsStatusDistribution.map((status, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-gray-600">{status.status}</span>
                        <span className="text-sm font-medium">{status.count} ({status.percentage.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-sm text-gray-600">Duração Média: </span>
                    <span className="text-sm font-medium">{Math.round(meetingsAppointmentsData.avgMeetingDuration)} min</span>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Agendamentos - Distribuição</h3>
                  <div className="space-y-2">
                    {meetingsAppointmentsData.appointmentsStatusDistribution.map((status, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-gray-600">{status.status}</span>
                        <span className="text-sm font-medium">{status.count} ({status.percentage.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-sm text-gray-600">Duração Média: </span>
                    <span className="text-sm font-medium">{Math.round(meetingsAppointmentsData.avgAppointmentDuration)} min</span>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Geral</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Reuniões</span>
                      <span className="text-sm font-medium">{meetingsAppointmentsData.totalMeetings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Agendamentos</span>
                      <span className="text-sm font-medium">{meetingsAppointmentsData.totalAppointments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Taxa Conclusão</span>
                      <span className="text-sm font-medium">{meetingsAppointmentsData.meetingCompletionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Taxa Comparecimento</span>
                      <span className="text-sm font-medium">{meetingsAppointmentsData.appointmentShowRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Métricas Adicionais de Vendas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Receita Total</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(reportData.totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-1">Valor total do pipeline</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Leads por Fonte</h3>
              <div className="space-y-2">
                {reportData.leadsBySource.slice(0, 3).map((source, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-gray-600">{source.source}</span>
                    <span className="text-sm font-medium">{source.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conversão</span>
                  <span className="text-sm font-medium">{reportData.conversionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ciclo Médio</span>
                  <span className="text-sm font-medium">{Math.round(reportData.avgSalesCycle)} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Leads Ativos</span>
                  <span className="text-sm font-medium">{reportData.qualifiedLeads}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Gráficos de Vendas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Mês</h3>
              <SalesChart data={reportData.salesByMonth} />
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline de Vendas</h3>
              <PipelineChart data={reportData.pipelineData} />
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades por Mês</h3>
            <ActivitiesChart data={reportData.activitiesByMonth} />
          </Card>

          {/* Seção: Exportar Relatórios */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Exportar Relatórios (CSV)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exportOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    <Button 
                      onClick={option.action}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Baixar CSV
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="closers" className="space-y-6">
          {/* Controles para Relatórios por Closer */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Selecionar Closer
                </label>
                <Select value={selectedCloser} onValueChange={setSelectedCloser}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um closer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {closers.map((closer) => (
                      <SelectItem key={closer.id} value={closer.id}>
                        {closer.full_name || closer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Período (dias)
                </label>
                <Select value={periodDays.toString()} onValueChange={(value) => setPeriodDays(Number(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="60">Últimos 60 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {selectedCloser && closerReportData && !isLoadingCloserReport && (
            <>
              {/* KPIs do Closer Selecionado */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Total de Leads</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{closerReportData.totalLeads}</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-6 h-6 text-green-600" />
                    <h3 className="font-medium text-gray-900">Conversões</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{closerReportData.convertedLeads}</p>
                  <p className="text-sm text-gray-500">Taxa: {closerReportData.conversionRate.toFixed(1)}%</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <h3 className="font-medium text-gray-900">Receita</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(closerReportData.totalRevenue)}</p>
                  <p className="text-sm text-gray-500">Ticket: {formatCurrency(closerReportData.avgDealValue)}</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-6 h-6 text-orange-600" />
                    <h3 className="font-medium text-gray-900">Agendamentos</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{closerReportData.totalAppointments}</p>
                  <p className="text-sm text-gray-500">Conclusão: {closerReportData.appointmentCompletionRate.toFixed(1)}%</p>
                </Card>
              </div>

              {/* Metas do Closer */}
              {Object.values(closerReportData.goals).some(goal => goal !== null) && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Progresso das Metas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(closerReportData.goals)
                      .filter(([_, goal]) => goal !== null)
                      .map(([type, goal]) => (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {type === 'vendas' ? 'Vendas' : type === 'receita' ? 'Receita' : 'Agendamentos'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {goal?.current || 0} / {goal?.target || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((goal?.progress || 0), 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">{(goal?.progress || 0).toFixed(1)}% concluído</p>
                        </div>
                      ))}
                  </div>
                </Card>
              )}

              {/* Gráficos do Closer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita por Mês</h3>
                  <SalesChart data={closerReportData.revenueByMonth.map(item => ({ ...item, count: item.value }))} />
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendamentos por Mês</h3>
                  <ActivitiesChart data={closerReportData.appointmentsByMonth.map(item => ({ month: item.month, tasks: item.count, appointments: 0 }))} />
                </Card>
              </div>

              {/* Leads por Status */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Leads por Status</h3>
                <PipelineChart data={closerReportData.leadsByStatus.map(item => ({ status: item.status, value: item.count, count: item.count }))} />
              </Card>

              {/* Exportações para o Closer */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar Dados do Closer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={exportCloserReportData} className="flex items-center gap-2">
                    <FileDown className="w-4 h-4" />
                    Relatório Completo
                  </Button>
                  
                  {Object.values(closerReportData.goals).some(goal => goal !== null) && (
                    <Button onClick={exportCloserGoalsData} variant="outline" className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Dados das Metas
                    </Button>
                  )}
                  
                  <Button 
                    onClick={exportClosersComparisonData} 
                    variant="outline" 
                    className="flex items-center gap-2"
                    disabled={!comparisonData}
                  >
                    <Trophy className="w-4 h-4" />
                    Comparativo
                  </Button>
                </div>
              </Card>
            </>
          )}

          {/* Comparativo entre Closers */}
          {comparisonData && !isLoadingComparison && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparativo entre Closers</h3>
              <div className="space-y-4">
                {comparisonData.closers.map((closer, index) => (
                  <div key={closer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{closer.name}</p>
                        <p className="text-sm text-gray-500">{closer.leads} leads • {closer.conversions} conversões</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(closer.revenue)}</p>
                      <p className="text-sm text-gray-500">{closer.conversionRate.toFixed(1)}% conversão</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{comparisonData.totalMetrics.totalLeads}</p>
                    <p className="text-sm text-gray-500">Total Leads</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{comparisonData.totalMetrics.totalConversions}</p>
                    <p className="text-sm text-gray-500">Total Conversões</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(comparisonData.totalMetrics.totalRevenue)}</p>
                    <p className="text-sm text-gray-500">Total Receita</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{comparisonData.totalMetrics.totalAppointments}</p>
                    <p className="text-sm text-gray-500">Total Agendamentos</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {!selectedCloser && (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um Closer</h3>
              <p className="text-gray-500">Escolha um closer para visualizar relatórios detalhados de performance</p>
            </Card>
          )}

          {(isLoadingCloserReport || isLoadingComparison) && (
            <Card className="p-12 text-center">
              <div className="text-lg">Carregando dados do closer...</div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
