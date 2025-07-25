import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SubcategoryChartProps {
  data: Array<{
    subcategory: string;
    amount: number;
  }>;
  categoryName: string;
  onBack: () => void;
}

export const SubcategoryChart = ({ data, categoryName, onBack }: SubcategoryChartProps) => {
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
          <p className="font-semibold">{data.subcategory}</p>
          <p className="text-primary">{formatCurrency(data.amount)}</p>
        </div>
      );
    }
    return null;
  };

  // Sort data in descending order
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h3 className="text-lg font-semibold">
          Subcategorias de {categoryName}
        </h3>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="subcategory" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount" 
              fill="hsl(var(--primary))"
              name="Valor Gasto"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};