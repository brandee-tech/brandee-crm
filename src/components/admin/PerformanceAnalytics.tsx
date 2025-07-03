import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SaasAnalyticsData } from '@/hooks/useSaasAnalytics';

interface PerformanceAnalyticsProps {
  data: SaasAnalyticsData['top_companies'];
}

export const PerformanceAnalytics = ({ data }: PerformanceAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Empresas por Atividade</CardTitle>
          <CardDescription>
            Empresas com maior pontuação de atividade no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length > 0 ? (
              data.map((company, index) => (
                <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{company.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {company.users_count} usuários • {company.leads_count} leads • {company.appointments_count} agendamentos
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{company.activity_score}</div>
                    <div className="text-sm text-muted-foreground">pontos</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma atividade registrada no período
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
          <CardDescription>
            Estatísticas gerais de performance do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">
                {data.length > 0 ? Math.round(data.reduce((acc, company) => acc + company.activity_score, 0) / data.length) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Pontuação Média</div>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.length > 0 ? Math.round(data.reduce((acc, company) => acc + company.users_count, 0) / data.length) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Usuários por Empresa</div>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.length > 0 ? Math.round(data.reduce((acc, company) => acc + company.leads_count, 0) / data.length) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Leads por Empresa</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};