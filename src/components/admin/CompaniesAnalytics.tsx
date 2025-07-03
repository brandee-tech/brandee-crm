import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SaasAnalyticsData } from '@/hooks/useSaasAnalytics';

interface CompaniesAnalyticsProps {
  data: SaasAnalyticsData['companies'];
}

export const CompaniesAnalytics = ({ data }: CompaniesAnalyticsProps) => {
  return (
    <div className="space-y-6">
      {/* Distribuição por Setor */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas por Setor</CardTitle>
          <CardDescription>
            Distribuição das empresas por setor de atuação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.by_industry).map(([industry, count]) => (
              <div key={industry} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="font-medium">{industry}</div>
                <div className="text-xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Tamanho */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas por Tamanho</CardTitle>
          <CardDescription>
            Distribuição das empresas por porte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.by_size).map(([size, count]) => (
              <div key={size} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="font-medium">{size}</div>
                <div className="text-xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crescimento de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Empresas</CardTitle>
          <CardDescription>
            Novas empresas cadastradas por dia no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.growth.length > 0 ? (
            <div className="space-y-2">
              {data.growth.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm font-medium">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="font-bold">{item.count} empresas</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma empresa cadastrada no período</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};