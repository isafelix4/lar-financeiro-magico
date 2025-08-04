import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@/types/financial";

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTransaction: Transaction) => void;
}

export const TransactionEditDialog = ({ 
  transaction, 
  isOpen, 
  onClose, 
  onUpdate 
}: TransactionEditDialogProps) => {
  const { categories, debts, processarPagamentoDivida } = useFinancialData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    subcategory: "",
    type: "despesa" as 'receita' | 'despesa',
    observations: ""
  });
  
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState("");

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        category: transaction.category,
        subcategory: transaction.subcategory || "",
        type: transaction.type,
        observations: transaction.observations || ""
      });
    }
  }, [transaction]);

  const getSubcategoryOptions = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.subcategories || [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction) return;

    const updatedTransaction: Transaction = {
      ...transaction,
      amount: parseFloat(formData.amount),
      category: formData.category,
      subcategory: formData.subcategory || undefined,
      type: formData.type,
      observations: formData.observations || undefined
    };

    // Check if category changed to "Dívidas" and wasn't before
    if (formData.category === 'Dívidas' && transaction.category !== 'Dívidas') {
      setShowDebtDialog(true);
      return;
    }

    onUpdate(updatedTransaction);
    onClose();
    
    toast({
      title: "Lançamento atualizado!",
      description: "As alterações foram salvas com sucesso."
    });
  };

  const handleDebtLinking = () => {
    if (!selectedDebt || !transaction) return;

    const debt = debts.find(d => d.id === selectedDebt);
    if (!debt) return;

    // Process debt payment
    processarPagamentoDivida(selectedDebt, parseFloat(formData.amount));

    const updatedTransaction: Transaction = {
      ...transaction,
      amount: parseFloat(formData.amount),
      category: formData.category,
      subcategory: formData.subcategory || undefined,
      type: formData.type,
      observations: formData.observations || undefined
    };

    onUpdate(updatedTransaction);
    setShowDebtDialog(false);
    setSelectedDebt("");
    onClose();
    
    toast({
      title: "Lançamento atualizado e dívida vinculada!",
      description: "O pagamento foi contabilizado na dívida selecionada."
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value,
      subcategory: "" // Reset subcategory when category changes
    }));
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Lançamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input 
              id="description" 
              value={transaction.description}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                required
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'receita' | 'despesa') => setFormData(prev => ({ ...prev, type: value }))}
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={handleCategoryChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(cat => cat.type === formData.type)
                    .map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategoria *</Label>
              <Select 
                value={formData.subcategory} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {getSubcategoryOptions(formData.category).map(subcategory => (
                    <SelectItem key={subcategory.id} value={subcategory.name}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea 
              id="observations"
              placeholder="Observações opcionais"
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>

        {/* Debt Linking Dialog */}
        {showDebtDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border rounded-lg p-6 max-w-md w-full m-4">
              <h3 className="text-lg font-semibold mb-4">Vincular à Dívida</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Este lançamento foi categorizado como "Dívidas". Selecione a dívida correspondente:
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label>Dívida</Label>
                  <Select value={selectedDebt} onValueChange={setSelectedDebt}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a dívida" />
                    </SelectTrigger>
                    <SelectContent>
                      {debts.map(debt => (
                        <SelectItem key={debt.id} value={debt.id}>
                          {debt.credor} - {debt.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowDebtDialog(false);
                      setSelectedDebt("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleDebtLinking}
                    disabled={!selectedDebt}
                  >
                    Vincular e Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};