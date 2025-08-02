import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Investment } from "@/types/financial";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface InvestmentReturnUpdaterProps {
  investments: Investment[];
  onUpdateReturn: (investmentId: string, ganhoMonetario: number, rentabilidadePercentual: number) => void;
}

const InvestmentReturnUpdater = ({ 
  investments, 
  onUpdateReturn
}: InvestmentReturnUpdaterProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState('');
  const [ganhoMonetario, setGanhoMonetario] = useState('');
  const [rentabilidadePercentual, setRentabilidadePercentual] = useState('');
  
  // Filter to show only variable investments (stocks, ETFs, crypto, REITs)
  const variableInvestments = investments.filter(investment =>
    ['Ações', 'ETF', 'Criptomoeda', 'Fundo Imobiliário (FII)'].includes(investment.tipoInvestimento)
  );

  const handleSubmit = () => {
    if (!selectedInvestment || !ganhoMonetario || !rentabilidadePercentual) {
      toast.error('Preencha todos os campos');
      return;
    }

    const ganhoValue = parseFloat(ganhoMonetario);
    const rentabilidadeValue = parseFloat(rentabilidadePercentual);
    
    if (isNaN(ganhoValue) || isNaN(rentabilidadeValue)) {
      toast.error('Valores inválidos');
      return;
    }

    onUpdateReturn(selectedInvestment, ganhoValue, rentabilidadeValue);
    toast.success('Rentabilidade atualizada com sucesso!');
    
    // Reset form
    setSelectedInvestment('');
    setGanhoMonetario('');
    setRentabilidadePercentual('');
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
          <DialogTitle>Atualizar Rentabilidade Mensal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="investment-select">Investimento de Renda Variável</Label>
            <Select value={selectedInvestment} onValueChange={setSelectedInvestment}>
              <SelectTrigger id="investment-select">
                <SelectValue placeholder="Selecione um investimento" />
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
            <Label htmlFor="ganho-monetario">Ganho/Perda Monetário (R$)</Label>
            <Input
              id="ganho-monetario"
              type="number"
              step="0.01"
              value={ganhoMonetario}
              onChange={(e) => setGanhoMonetario(e.target.value)}
              placeholder="Ex: 250.00"
            />
          </div>
          
          <div>
            <Label htmlFor="rentabilidade-percentual">Rentabilidade (%)</Label>
            <Input
              id="rentabilidade-percentual"
              type="number"
              step="0.01"
              value={rentabilidadePercentual}
              onChange={(e) => setRentabilidadePercentual(e.target.value)}
              placeholder="Ex: 5.25"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">
              Atualizar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentReturnUpdater;