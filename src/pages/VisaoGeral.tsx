import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { KPICards } from "@/components/dashboard/KPICards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { FiltersSection } from "@/components/dashboard/FiltersSection";
import { TransactionUpload } from "@/components/dashboard/TransactionUpload";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { TransactionReview } from "@/components/dashboard/TransactionReview";
import { TransactionEditDialog } from "@/components/dashboard/TransactionEditDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { PendingTransaction, Transaction } from "@/types/financial";

// Export Transaction type from types/financial.ts
export type { Transaction } from "@/types/financial";

const VisaoGeral = () => {
  const { transactions, addTransactions, updateTransaction, deleteTransaction } = useFinancialData();
  const { toast } = useToast();
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showSubcategories, setShowSubcategories] = useState<string | null>(null);

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
    setShowSubcategories(category);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    updateTransaction(updatedTransaction.id, updatedTransaction);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    deleteTransaction(transactionId);
    toast({
      title: "Lançamento excluído!",
      description: "O lançamento foi removido com sucesso."
    });
  };

  // Prepare subcategory data for drill-down
  const getSubcategoryData = (category: string) => {
    const categoryTransactions = filteredTransactions.filter(
      t => t.category === category && t.type === 'despesa'
    );
    
    const subcategoryTotals = categoryTransactions.reduce((acc, transaction) => {
      const subcategory = transaction.subcategory || 'Sem Subcategoria';
      acc[subcategory] = (acc[subcategory] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(subcategoryTotals).map(([subcategory, amount]) => ({
      subcategory,
      amount
    }));
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
            subcategoryData={showSubcategories ? getSubcategoryData(showSubcategories) : undefined}
            selectedCategory={showSubcategories || undefined}
            onCategoryClick={handleCategoryClick}
            onBackToCategories={() => setShowSubcategories(null)}
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
                    <TableHead className="w-12">Ações</TableHead>
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionEditDialog
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onUpdate={handleUpdateTransaction}
      />
    </div>
  );
};

export default VisaoGeral;