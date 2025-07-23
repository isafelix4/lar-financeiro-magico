import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, DollarSign } from "lucide-react";
import type { Transaction } from "@/pages/VisaoGeral";

interface TransactionListProps {
  transactions: Transaction[];
  categoryName: string;
  onBack: () => void;
}

export const TransactionList = ({ transactions, categoryName, onBack }: TransactionListProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalCategory = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Transações - {categoryName}
          </h1>
          <p className="text-muted-foreground">
            {transactions.length} transação(ões) • Total: {formatCurrency(totalCategory)}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                Nenhuma transação encontrada para esta categoria.
              </p>
            </CardContent>
          </Card>
        ) : (
          transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(transaction.date)}
                        </div>
                        {transaction.subcategory && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {transaction.subcategory}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-foreground mb-1">
                        {transaction.description}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Conta: {transaction.account}</span>
                        <span>Categoria: {transaction.category}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`flex items-center gap-1 text-lg font-bold ${
                        transaction.type === 'receita' ? 'text-success' : 'text-danger'
                      }`}>
                        <DollarSign className="h-5 w-5" />
                        {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        transaction.type === 'receita' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};