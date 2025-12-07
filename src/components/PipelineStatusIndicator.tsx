
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import { usePipelineColumns } from '@/hooks/usePipelineColumns';
import { useAppointments } from '@/hooks/useAppointments';
import { usePipelineSync } from '@/hooks/usePipelineSync';

export const PipelineStatusIndicator = () => {
  const { columns } = usePipelineColumns();
  const { appointments } = useAppointments();
  const { syncPipelineColumns, createDefaultColumns, syncing } = usePipelineSync();
  const [missingStatuses, setMissingStatuses] = useState<string[]>([]);

  useEffect(() => {
    // Check for appointment statuses that don't have corresponding pipeline columns
    const appointmentStatuses = [...new Set(appointments.map(app => app.status))];
    const columnNames = columns.map(col => col.name);
    const missing = appointmentStatuses.filter(status => !columnNames.includes(status));
    setMissingStatuses(missing);
  }, [appointments, columns]);

  return null;
};
