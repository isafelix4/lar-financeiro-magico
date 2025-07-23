import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICards } from "@/components/dashboard/KPICards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { FiltersSection } from "@/components/dashboard/FiltersSection";
import { TransactionUpload } from "@/components/dashboard/TransactionUpload";
import { TransactionList } from "@/components/dashboard/TransactionList";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  subcategory?: string;
  account: string;
}

const VisaoGeral = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedAccount, setSelectedAccount] = useState<string>("todas");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [showTransactions, setShowTransactions] = useState<string | null>(null);

  const handleTransactionsUploaded = (newTransactions: Transaction[]) => {
    setTransactions(prev => [...prev, ...newTransactions]);
  };

  // Filtrar transações baseado nos filtros selecionados
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const monthMatch = transactionDate.getMonth() + 1 === selectedMonth;
    const yearMatch = transactionDate.getFullYear() === selectedYear;
    const accountMatch = selectedAccount === "todas" || transaction.account === selectedAccount;
    const categoryMatch = selectedCategory === "todas" || transaction.category === selectedCategory;
    
    return monthMatch && yearMatch && accountMatch && categoryMatch;
  });

  // Calcular KPIs
  const receitas = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const despesas = filteredTransactions
    .filter(t => t.type === 'despesa' && !t.category.toLowerCase().includes('dívida'))
    .reduce((sum, t) => sum + t.amount, 0);

  const dividas = filteredTransactions
    .filter(t => t.type === 'despesa' && t.category.toLowerCase().includes('dívida'))
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoMensal = receitas - despesas - dividas;

  // Preparar dados para o gráfico
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: ((amount / despesas) * 100).toFixed(1)
  }));

  const handleCategoryClick = (category: string) => {
    setShowTransactions(category);
  };

  if (showTransactions) {
    const categoryTransactions = filteredTransactions.filter(
      t => t.category === showTransactions && t.type === 'despesa'
    );
    
    return (
      <TransactionList 
        transactions={categoryTransactions}
        categoryName={showTransactions}
        onBack={() => setShowTransactions(null)}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Visão Geral Financeira</h1>
        <TransactionUpload onTransactionsUploaded={handleTransactionsUploaded} />
      </div>

      <FiltersSection
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedAccount={selectedAccount}
        selectedCategory={selectedCategory}
        transactions={transactions}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onAccountChange={setSelectedAccount}
        onCategoryChange={setSelectedCategory}
      />

      <KPICards
        receitas={receitas}
        despesas={despesas}
        dividas={dividas}
        saldoMensal={saldoMensal}
      />

      <Card>
        <CardHeader>
          <CardTitle>Para Onde o Dinheiro Vai?</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseChart 
            data={chartData} 
            onCategoryClick={handleCategoryClick}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VisaoGeral;