
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ActivitiesChartProps {
  data: { month: string; tasks: number; appointments: number }[];
}

const chartConfig = {
  tasks: {
    label: "Tarefas",
    color: "hsl(var(--chart-1))",
  },
  appointments: {
    label: "Agendamentos",
    color: "hsl(var(--chart-2))",
  },
};

export const ActivitiesChart = ({ data }: ActivitiesChartProps) => {
  return (
    <ChartContainer config={chartConfig} className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line 
            type="monotone" 
            dataKey="tasks" 
            stroke="var(--color-tasks)" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="appointments" 
            stroke="var(--color-appointments)" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
