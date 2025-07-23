import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";

interface KPICardsProps {
  receitas: number;
  despesas: number;
  dividas: number;
  saldoMensal: number;
}

export const KPICards = ({ receitas, despesas, dividas, saldoMensal }: KPICardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-l-4 border-l-success">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Renda Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{formatCurrency(receitas)}</div>
          <p className="text-xs text-muted-foreground">
            Todas as entradas do mês
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-warning">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
          <DollarSign className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{formatCurrency(despesas)}</div>
          <p className="text-xs text-muted-foreground">
            Gastos exceto dívidas
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-danger">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor para Dívidas</CardTitle>
          <CreditCard className="h-4 w-4 text-danger" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-danger">{formatCurrency(dividas)}</div>
          <p className="text-xs text-muted-foreground">
            Pagamentos de dívidas
          </p>
        </CardContent>
      </Card>

      <Card className={`border-l-4 ${saldoMensal >= 0 ? 'border-l-success' : 'border-l-danger'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Mensal</CardTitle>
          {saldoMensal >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${saldoMensal >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(saldoMensal)}
          </div>
          <p className="text-xs text-muted-foreground">
            {saldoMensal >= 0 ? 'Sobrou no mês' : 'Déficit mensal'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};