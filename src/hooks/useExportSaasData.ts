import { useExcelUtils } from '@/lib/excel-utils';
import type { SaasAnalyticsData, AnalyticsFilters } from './useSaasAnalytics';

export const useExportSaasData = (analytics: SaasAnalyticsData | null, filters: AnalyticsFilters) => {
  const { convertToExcel, downloadExcelWithToast } = useExcelUtils();

  // Função para gerar nome do arquivo com filtros
  const generateFilename = (baseFilename: string) => {
    const filterSuffix = filters.company_filter ? '-empresa-especifica' : '';
    const periodSuffix = `-${filters.period_days}dias`;
    const dateSuffix = new Date().toISOString().split('T')[0];
    
    return `${baseFilename}${periodSuffix}${filterSuffix}-${dateSuffix}`;
  };

  const exportOverviewData = () => {
    if (!analytics) return;
    
    const data = [
      { metric: 'Total de Empresas', value: analytics.overview.total_companies },
      { metric: 'Total de Usuários', value: analytics.overview.total_users },
      { metric: 'Empresas Ativas', value: analytics.overview.active_companies },
      { metric: 'Novos Usuários (Período)', value: analytics.overview.new_users_this_period }
    ];
    
    const headers = { metric: 'Métrica', value: 'Valor' };
    const workbook = convertToExcel(data, headers, 'Overview');
    const filename = generateFilename('saas-overview');
    downloadExcelWithToast(workbook, filename, 'Relatório de overview exportado com sucesso!');
  };

  const exportCompaniesData = () => {
    if (!analytics) return;
    
    const planData = Object.entries(analytics.companies.by_plan).map(([plan, count]) => ({
      category: 'Plano',
      type: plan,
      quantity: count
    }));
    
    const industryData = Object.entries(analytics.companies.by_industry).map(([industry, count]) => ({
      category: 'Setor',
      type: industry,
      quantity: count
    }));
    
    const sizeData = Object.entries(analytics.companies.by_size).map(([size, count]) => ({
      category: 'Tamanho',
      type: size,
      quantity: count
    }));
    
    const growthData = analytics.companies.growth.map(item => ({
      category: 'Crescimento',
      type: new Date(item.date).toLocaleDateString('pt-BR'),
      quantity: item.count
    }));
    
    const allData = [...planData, ...industryData, ...sizeData, ...growthData];
    
    const headers = { category: 'Categoria', type: 'Tipo/Data', quantity: 'Quantidade' };
    const workbook = convertToExcel(allData, headers, 'Empresas');
    const filename = generateFilename('empresas-analytics');
    downloadExcelWithToast(workbook, filename, 'Relatório de empresas exportado com sucesso!');
  };

  const exportUsersData = () => {
    if (!analytics) return;
    
    const roleData = Object.entries(analytics.users.by_role).map(([role, count]) => ({
      category: 'Cargo',
      type: role,
      quantity: count
    }));
    
    const growthData = analytics.users.growth.map(item => ({
      category: 'Crescimento',
      type: new Date(item.date).toLocaleDateString('pt-BR'),
      quantity: item.count
    }));
    
    const allData = [...roleData, ...growthData];
    
    const headers = { category: 'Categoria', type: 'Tipo/Data', quantity: 'Quantidade' };
    const workbook = convertToExcel(allData, headers, 'Usuários');
    const filename = generateFilename('usuarios-analytics');
    downloadExcelWithToast(workbook, filename, 'Relatório de usuários exportado com sucesso!');
  };

  const exportActivitiesData = () => {
    if (!analytics) return;
    
    const leadsData = Object.entries(analytics.activities.leads.by_status).map(([status, count]) => ({
      activity: 'Leads',
      status,
      quantity: count,
      total: analytics.activities.leads.total
    }));
    
    const appointmentsData = Object.entries(analytics.activities.appointments.by_status).map(([status, count]) => ({
      activity: 'Agendamentos',
      status,
      quantity: count,
      total: analytics.activities.appointments.total
    }));
    
    const meetingsData = Object.entries(analytics.activities.meetings.by_status).map(([status, count]) => ({
      activity: 'Reuniões',
      status,
      quantity: count,
      total: analytics.activities.meetings.total
    }));
    
    const tasksData = Object.entries(analytics.activities.tasks.by_status).map(([status, count]) => ({
      activity: 'Tarefas',
      status,
      quantity: count,
      total: analytics.activities.tasks.total
    }));
    
    const allData = [...leadsData, ...appointmentsData, ...meetingsData, ...tasksData];
    
    const headers = { 
      activity: 'Atividade', 
      status: 'Status', 
      quantity: 'Quantidade',
      total: 'Total da Atividade'
    };
    const workbook = convertToExcel(allData, headers, 'Atividades');
    const filename = generateFilename('atividades-analytics');
    downloadExcelWithToast(workbook, filename, 'Relatório de atividades exportado com sucesso!');
  };

  const exportPerformanceData = () => {
    if (!analytics) return;
    
    const headers = {
      name: 'Empresa',
      users_count: 'Usuários',
      leads_count: 'Leads',
      appointments_count: 'Agendamentos',
      activity_score: 'Pontuação'
    };
    
    const workbook = convertToExcel(analytics.top_companies, headers, 'Performance');
    const filename = generateFilename('performance-empresas');
    downloadExcelWithToast(workbook, filename, 'Relatório de performance exportado com sucesso!');
  };

  const exportCompleteReport = () => {
    if (!analytics) return;
    
    // Criar múltiplas planilhas em um workbook
    const workbook = convertToExcel([], {}, 'Relatório Completo');
    
    // Dados do overview
    const overviewData = [
      { secao: 'OVERVIEW GERAL', item: 'Total de Empresas', valor: analytics.overview.total_companies },
      { secao: 'OVERVIEW GERAL', item: 'Total de Usuários', valor: analytics.overview.total_users },
      { secao: 'OVERVIEW GERAL', item: 'Empresas Ativas', valor: analytics.overview.active_companies },
      { secao: 'OVERVIEW GERAL', item: 'Novos Usuários (Período)', valor: analytics.overview.new_users_this_period },
      ...Object.entries(analytics.companies.by_plan).map(([plan, count]) => ({
        secao: 'EMPRESAS POR PLANO',
        item: plan,
        valor: count
      })),
      ...Object.entries(analytics.users.by_role).map(([role, count]) => ({
        secao: 'USUÁRIOS POR CARGO',
        item: role,
        valor: count
      }))
    ];
    
    const overviewHeaders = { secao: 'Seção', item: 'Item', valor: 'Valor' };
    const overviewWorkbook = convertToExcel(overviewData, overviewHeaders, 'Relatório Geral');
    
    const filename = generateFilename('relatorio-completo-saas');
    downloadExcelWithToast(overviewWorkbook, filename, 'Relatório completo exportado com sucesso!');
  };

  return {
    exportOverviewData,
    exportCompaniesData,
    exportUsersData,
    exportActivitiesData,
    exportPerformanceData,
    exportCompleteReport
  };
};