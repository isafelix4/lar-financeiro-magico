import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICards } from "@/components/dashboard/KPICards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { FiltersSection } from "@/components/dashboard/FiltersSection";
import { TransactionUpload } from "@/components/dashboard/TransactionUpload";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { TransactionReview } from "@/components/dashboard/TransactionReview";
import { useFinancialData } from "@/hooks/useFinancialData";
import type { PendingTransaction, Transaction } from "@/types/financial";

// Export Transaction type from types/financial.ts
export type { Transaction } from "@/types/financial";

const VisaoGeral = () => {
  const { transactions, addTransactions } = useFinancialData();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedAccount, setSelectedAccount] = useState<string>("todas");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [showTransactions, setShowTransactions] = useState<string | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [pendingAccount, setPendingAccount] = useState<string>("");
  const [pendingMonth, setPendingMonth] = useState<number>(0);
  const [pendingYear, setPendingYear] = useState<number>(0);
  const [showReview, setShowReview] = useState(false);

  const handlePendingTransactions = (
    transactions: PendingTransaction[], 
    account: string, 
    month: number, 
    year: number
  ) => {
    setPendingTransactions(transactions);
    setPendingAccount(account);
    setPendingMonth(month);
    setPendingYear(year);
    setShowReview(true);
  };

  const handleApproveTransactions = (approvedTransactions: Transaction[]) => {
    addTransactions(approvedTransactions);
    setShowReview(false);
    setPendingTransactions([]);
  };

  const handleCancelReview = () => {
    setShowReview(false);
    setPendingTransactions([]);
  };

  // Filtrar transações baseado nos filtros selecionados
  const filteredTransactions = transactions.filter(transaction => {
    const monthMatch = transaction.month === selectedMonth;
    const yearMatch = transaction.year === selectedYear;
    const accountMatch = selectedAccount === "todas" || transaction.account === selectedAccount;
    const categoryMatch = selectedCategory === "todas" || transaction.category === selectedCategory;
    
    return monthMatch && yearMatch && accountMatch && categoryMatch;
  });

  // Calcular KPIs
  const receitas = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const despesas = filteredTransactions
    .filter(t => t.type === 'despesa' && t.category !== 'Dívidas')
    .reduce((sum, t) => sum + t.amount, 0);

  const dividas = filteredTransactions
    .filter(t => t.type === 'despesa' && t.category === 'Dívidas')
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

  if (showReview) {
    return (
      <TransactionReview
        pendingTransactions={pendingTransactions}
        selectedAccount={pendingAccount}
        selectedMonth={pendingMonth}
        selectedYear={pendingYear}
        onApprove={handleApproveTransactions}
        onCancel={handleCancelReview}
      />
    );
  }

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
        <TransactionUpload onPendingTransactions={handlePendingTransactions} />
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