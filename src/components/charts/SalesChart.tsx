
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface SalesChartProps {
  data: { month: string; value: number; count: number }[];
}

const chartConfig = {
  value: {
    label: "Valor (R$)",
    color: "hsl(var(--chart-1))",
  },
  count: {
    label: "Quantidade",
    color: "hsl(var(--chart-2))",
  },
};

export const SalesChart = ({ data }: SalesChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ChartContainer config={chartConfig} className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatCurrency} />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value, name) => [
              name === 'value' ? formatCurrency(Number(value)) : value,
              name === 'value' ? 'Valor' : 'Quantidade'
            ]}
          />
          <Bar dataKey="value" fill="var(--color-value)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
