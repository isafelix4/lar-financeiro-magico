import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Investment } from "@/types/financial";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface InvestmentReturnUpdaterProps {
  investments: Investment[];
  onUpdateReturn: (investmentId: string, newReturn: number, month: number, year: number) => void;
  selectedMonth: number;
  selectedYear: number;
}

const InvestmentReturnUpdater = ({ 
  investments, 
  onUpdateReturn, 
  selectedMonth, 
  selectedYear 
}: InvestmentReturnUpdaterProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState('');
  const [monthlyReturn, setMonthlyReturn] = useState('');

  const variableInvestments = investments.filter(inv => 
    ['Ações', 'ETF', 'Criptomoeda', 'Fundo Imobiliário (FII)'].includes(inv.tipoInvestimento)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvestment || !monthlyReturn) {
      toast.error('Preencha todos os campos');
      return;
    }

    const returnValue = parseFloat(monthlyReturn);
    if (isNaN(returnValue)) {
      toast.error('Valor de rentabilidade inválido');
      return;
    }

    onUpdateReturn(selectedInvestment, returnValue, selectedMonth, selectedYear);
    toast.success('Rentabilidade atualizada com sucesso!');
    
    setSelectedInvestment('');
    setMonthlyReturn('');
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Atualizar Rentabilidade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Atualizar Rentabilidade Mensal - {selectedMonth.toString().padStart(2, '0')}/{selectedYear}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="investment-select">Investimento</Label>
            <Select value={selectedInvestment} onValueChange={setSelectedInvestment}>
              <SelectTrigger id="investment-select">
                <SelectValue placeholder="Selecione um investimento de renda variável" />
              </SelectTrigger>
              <SelectContent>
                {variableInvestments.map((investment) => (
                  <SelectItem key={investment.id} value={investment.id}>
                    {investment.nome} ({investment.tipoInvestimento})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="monthly-return">Rentabilidade do Mês (%)</Label>
            <Input
              id="monthly-return"
              type="number"
              step="0.01"
              value={monthlyReturn}
              onChange={(e) => setMonthlyReturn(e.target.value)}
              placeholder="Ex: 2.5 para 2,5%"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Atualizar
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentReturnUpdater;