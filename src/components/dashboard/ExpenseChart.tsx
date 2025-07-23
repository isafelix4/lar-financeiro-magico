import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface ExpenseChartProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: string;
  }>;
  onCategoryClick: (category: string) => void;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))'
];

export const ExpenseChart = ({ data, onCategoryClick }: ExpenseChartProps) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 border rounded-lg shadow-md">
          <p className="font-semibold">{data.category}</p>
          <p className="text-primary">{formatCurrency(data.amount)}</p>
          <p className="text-muted-foreground">{data.percentage}% do total</p>
        </div>
      );
    }
    return null;
  };

  const handlePieClick = (entry: any) => {
    onCategoryClick(entry.category);
  };

  const handleBarClick = (entry: any) => {
    onCategoryClick(entry.category);
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Nenhuma despesa encontrada para o período selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        <Button
          variant={chartType === 'pie' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('pie')}
        >
          <PieChartIcon className="h-4 w-4 mr-2" />
          Pizza
        </Button>
        <Button
          variant={chartType === 'bar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('bar')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Barras
        </Button>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category}: ${percentage}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="amount"
                onClick={handlePieClick}
                className="cursor-pointer"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="amount" 
                fill="hsl(var(--primary))"
                onClick={handleBarClick}
                className="cursor-pointer"
                name="Valor Gasto"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Clique em uma categoria para ver as transações detalhadas
      </div>
    </div>
  );
};