import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@/pages/VisaoGeral";

interface TransactionUploadProps {
  onTransactionsUploaded: (transactions: Transaction[]) => void;
}

export const TransactionUpload = ({ onTransactionsUploaded }: TransactionUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const categorizeTransaction = (description: string): string => {
    const desc = description.toLowerCase();
    
    // Transporte
    if (desc.includes('uber') || desc.includes('99') || desc.includes('posto') || 
        desc.includes('gasolina') || desc.includes('combustivel') || desc.includes('bus') ||
        desc.includes('metro') || desc.includes('taxi')) {
      return 'Transporte';
    }
    
    // Alimentação
    if (desc.includes('supermercado') || desc.includes('ifood') || desc.includes('restaurante') ||
        desc.includes('padaria') || desc.includes('lanche') || desc.includes('mercado') ||
        desc.includes('feira') || desc.includes('alimentacao') || desc.includes('comida')) {
      return 'Alimentação';
    }
    
    // Lazer
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('cinema') ||
        desc.includes('streaming') || desc.includes('filme') || desc.includes('teatro') ||
        desc.includes('show') || desc.includes('festa') || desc.includes('diversao')) {
      return 'Lazer';
    }
    
    // Saúde
    if (desc.includes('farmacia') || desc.includes('hospital') || desc.includes('medico') ||
        desc.includes('clinica') || desc.includes('laboratorio') || desc.includes('exame') ||
        desc.includes('remedio') || desc.includes('plano de saude') || desc.includes('consulta')) {
      return 'Saúde';
    }
    
    // Casa
    if (desc.includes('condominio') || desc.includes('aluguel') || desc.includes('energia') ||
        desc.includes('agua') || desc.includes('gas') || desc.includes('internet') ||
        desc.includes('telefone') || desc.includes('limpeza') || desc.includes('reforma')) {
      return 'Casa';
    }
    
    // Educação
    if (desc.includes('escola') || desc.includes('faculdade') || desc.includes('curso') ||
        desc.includes('livro') || desc.includes('material escolar') || desc.includes('mensalidade')) {
      return 'Educação';
    }
    
    // Dívidas
    if (desc.includes('cartao') || desc.includes('financiamento') || desc.includes('emprestimo') ||
        desc.includes('parcela') || desc.includes('juros') || desc.includes('divida')) {
      return 'Dívidas';
    }
    
    // Vestuário
    if (desc.includes('roupa') || desc.includes('sapato') || desc.includes('calcado') ||
        desc.includes('loja') || desc.includes('vestuario') || desc.includes('moda')) {
      return 'Vestuário';
    }
    
    return 'Outros';
  };

  const isIncome = (description: string, amount: number): boolean => {
    const desc = description.toLowerCase();
    return amount > 0 && (
      desc.includes('salario') || desc.includes('transferencia') || 
      desc.includes('deposito') || desc.includes('pix recebido') ||
      desc.includes('ted recebido') || desc.includes('renda') ||
      desc.includes('freelance') || desc.includes('bonus')
    );
  };

  const parseCSV = (csvText: string): Transaction[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const transactions: Transaction[] = [];
    
    // Pular o cabeçalho se existir
    const dataLines = lines.slice(1);
    
    dataLines.forEach((line, index) => {
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length >= 3) {
        const [date, description, amountStr, accountStr] = columns;
        const amount = Math.abs(parseFloat(amountStr.replace(/[^\d.-]/g, '')));
        const account = accountStr || 'Conta Principal';
        
        if (!isNaN(amount) && amount > 0) {
          const transaction: Transaction = {
            id: `csv-${Date.now()}-${index}`,
            date: new Date(date).toISOString().split('T')[0],
            description: description || 'Transação sem descrição',
            amount: amount,
            type: isIncome(description, amount) ? 'receita' : 'despesa',
            category: categorizeTransaction(description),
            account: account
          };
          
          transactions.push(transaction);
        }
      }
    });
    
    return transactions;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const text = await file.text();
      let transactions: Transaction[] = [];
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        transactions = parseCSV(text);
      } else {
        throw new Error('Formato de arquivo não suportado. Use CSV.');
      }
      
      if (transactions.length === 0) {
        throw new Error('Nenhuma transação válida encontrada no arquivo.');
      }
      
      onTransactionsUploaded(transactions);
      
      toast({
        title: "Upload realizado com sucesso!",
        description: `${transactions.length} transações foram importadas e categorizadas automaticamente.`,
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Limpar o input
      event.target.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Importar Extrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Extrato Bancário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Selecione um arquivo CSV do seu extrato bancário
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" disabled={isUploading} asChild>
                <span className="cursor-pointer">
                  {isUploading ? 'Processando...' : 'Escolher Arquivo'}
                </span>
              </Button>
            </label>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-2">Formato esperado do CSV:</p>
                <p className="text-muted-foreground">
                  Data, Descrição, Valor, Conta (opcional)
                </p>
                <p className="text-muted-foreground mt-1">
                  As transações serão categorizadas automaticamente baseadas na descrição.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};