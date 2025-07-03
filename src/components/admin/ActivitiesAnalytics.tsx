import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SaasAnalyticsData } from '@/hooks/useSaasAnalytics';

interface ActivitiesAnalyticsProps {
  data: SaasAnalyticsData['activities'];
}

export const ActivitiesAnalytics = ({ data }: ActivitiesAnalyticsProps) => {
  return (
    <div className="space-y-6">
      {/* Leads por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Leads por Status</CardTitle>
          <CardDescription>
            Distribuição dos leads por status ({data.leads.total} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.leads.by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="font-medium">{status}</div>
                <div className="text-xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agendamentos por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos por Status</CardTitle>
          <CardDescription>
            Distribuição dos agendamentos por status ({data.appointments.total} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.appointments.by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="font-medium">{status}</div>
                <div className="text-xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reuniões por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Reuniões por Status</CardTitle>
          <CardDescription>
            Distribuição das reuniões por status ({data.meetings.total} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.meetings.by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="font-medium">{status}</div>
                <div className="text-xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tarefas por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas por Status</CardTitle>
          <CardDescription>
            Distribuição das tarefas por status ({data.tasks.total} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.tasks.by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="font-medium">{status}</div>
                <div className="text-xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};