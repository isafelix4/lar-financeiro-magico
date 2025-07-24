import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICards } from "@/components/dashboard/KPICards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { FiltersSection } from "@/components/dashboard/FiltersSection";
import { TransactionUpload } from "@/components/dashboard/TransactionUpload";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { TransactionReview } from "@/components/dashboard/TransactionReview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinancialData } from "@/hooks/useFinancialData";
import type { PendingTransaction, Transaction } from "@/types/financial";

// Export Transaction type from types/financial.ts
export type { Transaction } from "@/types/financial";

const VisaoGeral = () => {
  const { transactions, addTransactions } = useFinancialData();
  const [selectedMonth, setSelectedMonth] = useState<number[]>([new Date().getMonth() + 1]);
  const [selectedYear, setSelectedYear] = useState<number[]>([new Date().getFullYear()]);
  const [selectedAccount, setSelectedAccount] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string[]>([]);
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
    // Ignorar transferências nos cálculos
    if (transaction.category === 'Transferências' || 
        transaction.subcategory === 'Transferência entre Contas') {
      return false;
    }

    const monthMatch = selectedMonth.length === 0 || selectedMonth.includes(transaction.month);
    const yearMatch = selectedYear.length === 0 || selectedYear.includes(transaction.year);
    const accountMatch = selectedAccount.length === 0 || selectedAccount.includes(transaction.account);
    const categoryMatch = selectedCategory.length === 0 || selectedCategory.includes(transaction.category);
    const subcategoryMatch = selectedSubcategory.length === 0 || 
      (transaction.subcategory && selectedSubcategory.includes(transaction.subcategory));
    
    return monthMatch && yearMatch && accountMatch && categoryMatch && subcategoryMatch;
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
        selectedSubcategory={selectedSubcategory}
        transactions={transactions}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onAccountChange={setSelectedAccount}
        onCategoryChange={setSelectedCategory}
        onSubcategoryChange={setSelectedSubcategory}
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

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum lançamento encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Lançamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Subcategoria</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell className={transaction.type === 'receita' ? 'text-primary' : 'text-destructive'}>
                        {transaction.type === 'receita' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.subcategory || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VisaoGeral;