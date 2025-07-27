import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Debt } from '@/types/financial';

interface DebtEvolutionChartProps {
  debts: Debt[];
}

export const DebtEvolutionChart = ({ debts }: DebtEvolutionChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Generate chart data for the last 12 months
  const generateChartData = () => {
    const chartData = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthLabel = month.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      // Calculate total outstanding balance for this month
      const totalBalance = debts.reduce((sum, debt) => {
        // Check if debt was active in this month
        const debtStartDate = new Date(debt.dataInicio);
        if (debtStartDate <= month) {
          return sum + debt.saldoDevedor;
        }
        return sum;
      }, 0);
      
      // Count active debts
      const activeDebts = debts.filter(debt => {
        const debtStartDate = new Date(debt.dataInicio);
        return debtStartDate <= month && debt.parcelasRestantes > 0;
      }).length;
      
      chartData.push({
        mes: monthLabel,
        saldoTotal: totalBalance,
        quantidadeAtivas: activeDebts
      });
    }
    
    return chartData;
  };

  const chartData = generateChartData();

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis 
            yAxisId="left"
            tickFormatter={(value) => formatCurrency(value)}
            orientation="left"
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[0, 'dataMax']}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'Saldo Total') {
                return [formatCurrency(value), name];
              }
              return [value, name];
            }}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="saldoTotal" 
            stroke="hsl(var(--destructive))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
            name="Saldo Total"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="quantidadeAtivas" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
            name="Quantidade de Dívidas Ativas"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};