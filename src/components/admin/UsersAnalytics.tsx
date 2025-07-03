import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SaasAnalyticsData } from '@/hooks/useSaasAnalytics';

interface UsersAnalyticsProps {
  data: SaasAnalyticsData['users'];
}

export const UsersAnalytics = ({ data }: UsersAnalyticsProps) => {
  return (
    <div className="space-y-6">
      {/* Distribuição por Cargo */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários por Cargo</CardTitle>
          <CardDescription>
            Distribuição dos usuários por função/cargo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.by_role).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="font-medium">{role}</div>
                <div className="text-xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crescimento de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Usuários</CardTitle>
          <CardDescription>
            Novos usuários cadastrados por dia no período
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
                  <span className="font-bold">{item.count} usuários</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum usuário cadastrado no período</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};