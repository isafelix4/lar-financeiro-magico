import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, ArrowLeft, Trash2, Plus } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import type { PendingTransaction, Transaction } from "@/types/financial";

interface TransactionReviewProps {
  pendingTransactions: PendingTransaction[];
  selectedAccount: string;
  selectedMonth: number;
  selectedYear: number;
  onApprove: (transactions: Transaction[]) => void;
  onCancel: () => void;
}

export const TransactionReview = ({ 
  pendingTransactions, 
  selectedAccount, 
  selectedMonth, 
  selectedYear,
  onApprove, 
  onCancel 
}: TransactionReviewProps) => {
  const { categories } = useFinancialData();
  const { toast } = useToast();
  
  const [reviewedTransactions, setReviewedTransactions] = useState<PendingTransaction[]>(
    pendingTransactions.map(pt => ({ ...pt }))
  );
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const updateTransaction = (index: number, field: keyof PendingTransaction, value: any) => {
    setReviewedTransactions(prev => prev.map((transaction, i) => 
      i === index ? { ...transaction, [field]: value } : transaction
    ));
  };

  const removeTransaction = (index: number) => {
    setReviewedTransactions(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Transação removida",
      description: "A transação foi excluída da importação."
    });
  };

  const addManualTransaction = (formData: FormData) => {
    const newTransaction: PendingTransaction = {
      id: `manual-${Date.now()}`,
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      suggestedCategory: formData.get('category') as string,
      suggestedSubcategory: formData.get('subcategory') as string || undefined,
      suggestedType: formData.get('type') as 'receita' | 'despesa'
    };

    setReviewedTransactions(prev => [...prev, newTransaction]);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Lançamento adicionado!",
      description: "O lançamento manual foi adicionado à lista."
    });
  };

  const handleApprove = () => {
    const finalTransactions: Transaction[] = reviewedTransactions.map(pt => ({
      id: `transaction-${Date.now()}-${Math.random()}`,
      date: pt.date,
      description: pt.description,
      amount: Math.abs(pt.amount),
      type: pt.suggestedType,
      category: pt.suggestedCategory,
      subcategory: pt.suggestedSubcategory,
      account: selectedAccount,
      month: selectedMonth,
      year: selectedYear
    }));

    onApprove(finalTransactions);
    
    toast({
      title: "Transações aprovadas!",
      description: `${finalTransactions.length} transações foram importadas com sucesso.`
    });
  };

  const getCategoryOptions = (type: 'receita' | 'despesa') => {
    return categories.filter(cat => cat.type === type);
  };

  const getSubcategoryOptions = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.subcategories || [];
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Revisar Categorização
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Lançamento Manual
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Lançamento Manual</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addManualTransaction(formData);
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    required 
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input id="description" name="description" required placeholder="Ex: Compra no supermercado" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0,00" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="despesa">Despesa</SelectItem>
                        <SelectItem value="receita">Receita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategoria (Opcional)</Label>
                    <Input id="subcategory" name="subcategory" placeholder="Ex: Supermercado" />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Adicionar Lançamento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleApprove}>
            <Check className="h-4 w-4 mr-2" />
            Aprovar Todas
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {reviewedTransactions.length} transações para revisar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviewedTransactions.map((transaction, index) => (
              <div 
                key={transaction.id} 
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={transaction.suggestedType === 'receita' ? 'default' : 'destructive'}>
                        {transaction.suggestedType === 'receita' ? 'Receita' : 'Despesa'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="font-medium text-foreground mb-1">
                      {transaction.description}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeTransaction(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Tipo
                    </label>
                    <Select
                      value={transaction.suggestedType}
                      onValueChange={(value: 'receita' | 'despesa') => 
                        updateTransaction(index, 'suggestedType', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="despesa">Despesa</SelectItem>
                        <SelectItem value="receita">Receita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Categoria
                    </label>
                    <Select
                      value={transaction.suggestedCategory}
                      onValueChange={(value) => {
                        updateTransaction(index, 'suggestedCategory', value);
                        updateTransaction(index, 'suggestedSubcategory', undefined);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCategoryOptions(transaction.suggestedType).map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Subcategoria
                    </label>
                    <Select
                      value={transaction.suggestedSubcategory || 'none'}
                      onValueChange={(value) => 
                        updateTransaction(index, 'suggestedSubcategory', value === 'none' ? undefined : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {getSubcategoryOptions(transaction.suggestedCategory).map(subcategory => (
                          <SelectItem key={subcategory.id} value={subcategory.name}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};