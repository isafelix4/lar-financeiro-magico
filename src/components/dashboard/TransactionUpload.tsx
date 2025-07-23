import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFinancialData } from "@/hooks/useFinancialData";
import * as XLSX from 'xlsx';
import type { PendingTransaction } from "@/types/financial";

interface TransactionUploadProps {
  onPendingTransactions: (
    transactions: PendingTransaction[], 
    account: string, 
    month: number, 
    year: number
  ) => void;
}

export const TransactionUpload = ({ onPendingTransactions }: TransactionUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newAccountName, setNewAccountName] = useState("");
  const { toast } = useToast();
  const { categories, accounts, addAccount } = useFinancialData();

  const categorizeTransaction = (description: string): { category: string; subcategory?: string; type: 'receita' | 'despesa' } => {
    const desc = description.toLowerCase();
    
    // Detectar receitas primeiro
    if (desc.includes('salario') || desc.includes('pix recebido') || desc.includes('ted recebido') ||
        desc.includes('transferencia recebida') || desc.includes('deposito') || desc.includes('renda') ||
        desc.includes('freelance') || desc.includes('bonus') || desc.includes('dividendo')) {
      if (desc.includes('salario') || desc.includes('bonus')) {
        return { category: 'Salário', type: 'receita' };
      }
      if (desc.includes('freelance')) {
        return { category: 'Freelance', type: 'receita' };
      }
      if (desc.includes('dividendo')) {
        return { category: 'Investimentos', subcategory: 'Dividendos', type: 'receita' };
      }
      return { category: 'Outros', type: 'receita' };
    }
    
    // Categorizar despesas
    if (desc.includes('uber') || desc.includes('99') || desc.includes('posto') || 
        desc.includes('gasolina') || desc.includes('combustivel') || desc.includes('bus') ||
        desc.includes('metro') || desc.includes('taxi')) {
      if (desc.includes('posto') || desc.includes('gasolina') || desc.includes('combustivel')) {
        return { category: 'Transporte', subcategory: 'Combustível', type: 'despesa' };
      }
      if (desc.includes('uber') || desc.includes('99') || desc.includes('taxi')) {
        return { category: 'Transporte', subcategory: 'Aplicativo de Transporte', type: 'despesa' };
      }
      return { category: 'Transporte', type: 'despesa' };
    }
    
    if (desc.includes('supermercado') || desc.includes('ifood') || desc.includes('restaurante') ||
        desc.includes('padaria') || desc.includes('lanche') || desc.includes('mercado') ||
        desc.includes('feira') || desc.includes('alimentacao') || desc.includes('comida')) {
      if (desc.includes('supermercado') || desc.includes('mercado')) {
        return { category: 'Alimentação', subcategory: 'Supermercado', type: 'despesa' };
      }
      if (desc.includes('ifood')) {
        return { category: 'Alimentação', subcategory: 'Delivery', type: 'despesa' };
      }
      if (desc.includes('restaurante')) {
        return { category: 'Alimentação', subcategory: 'Restaurantes', type: 'despesa' };
      }
      return { category: 'Alimentação', type: 'despesa' };
    }
    
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('cinema') ||
        desc.includes('streaming') || desc.includes('filme') || desc.includes('teatro') ||
        desc.includes('show') || desc.includes('festa') || desc.includes('diversao')) {
      if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('streaming')) {
        return { category: 'Lazer', subcategory: 'Streaming', type: 'despesa' };
      }
      if (desc.includes('cinema')) {
        return { category: 'Lazer', subcategory: 'Cinema', type: 'despesa' };
      }
      return { category: 'Lazer', type: 'despesa' };
    }
    
    if (desc.includes('farmacia') || desc.includes('hospital') || desc.includes('medico') ||
        desc.includes('clinica') || desc.includes('laboratorio') || desc.includes('exame') ||
        desc.includes('remedio') || desc.includes('plano de saude') || desc.includes('consulta')) {
      if (desc.includes('farmacia') || desc.includes('remedio')) {
        return { category: 'Saúde', subcategory: 'Farmácia', type: 'despesa' };
      }
      if (desc.includes('plano de saude')) {
        return { category: 'Saúde', subcategory: 'Plano de Saúde', type: 'despesa' };
      }
      if (desc.includes('medico') || desc.includes('consulta')) {
        return { category: 'Saúde', subcategory: 'Consultas Médicas', type: 'despesa' };
      }
      return { category: 'Saúde', type: 'despesa' };
    }
    
    if (desc.includes('condominio') || desc.includes('aluguel') || desc.includes('energia') ||
        desc.includes('agua') || desc.includes('gas') || desc.includes('internet') ||
        desc.includes('telefone') || desc.includes('limpeza') || desc.includes('reforma')) {
      if (desc.includes('aluguel')) {
        return { category: 'Casa', subcategory: 'Aluguel', type: 'despesa' };
      }
      if (desc.includes('condominio')) {
        return { category: 'Casa', subcategory: 'Condomínio', type: 'despesa' };
      }
      if (desc.includes('energia')) {
        return { category: 'Casa', subcategory: 'Energia Elétrica', type: 'despesa' };
      }
      if (desc.includes('agua')) {
        return { category: 'Casa', subcategory: 'Água', type: 'despesa' };
      }
      if (desc.includes('internet')) {
        return { category: 'Casa', subcategory: 'Internet', type: 'despesa' };
      }
      return { category: 'Casa', type: 'despesa' };
    }
    
    if (desc.includes('escola') || desc.includes('faculdade') || desc.includes('curso') ||
        desc.includes('livro') || desc.includes('material escolar') || desc.includes('mensalidade')) {
      return { category: 'Educação', type: 'despesa' };
    }
    
    if (desc.includes('cartao') || desc.includes('financiamento') || desc.includes('emprestimo') ||
        desc.includes('parcela') || desc.includes('juros') || desc.includes('divida')) {
      if (desc.includes('cartao')) {
        return { category: 'Dívidas', subcategory: 'Cartão de Crédito', type: 'despesa' };
      }
      if (desc.includes('financiamento')) {
        return { category: 'Dívidas', subcategory: 'Financiamento', type: 'despesa' };
      }
      if (desc.includes('emprestimo')) {
        return { category: 'Dívidas', subcategory: 'Empréstimo', type: 'despesa' };
      }
      return { category: 'Dívidas', type: 'despesa' };
    }
    
    if (desc.includes('roupa') || desc.includes('sapato') || desc.includes('calcado') ||
        desc.includes('loja') || desc.includes('vestuario') || desc.includes('moda')) {
      return { category: 'Vestuário', type: 'despesa' };
    }
    
    return { category: 'Outros', type: 'despesa' };
  };


  const parseFile = (fileData: any[], fileName: string): PendingTransaction[] => {
    const transactions: PendingTransaction[] = [];
    
    fileData.forEach((row, index) => {
      // Esperamos 3 colunas: data, lançamento (descrição), valor
      const date = row[0] || row.data || row.Data || row.DATE;
      const description = row[1] || row.lancamento || row.lançamento || row.Lançamento || row.descricao || row.Descrição || row.DESCRIPTION;
      const amountStr = row[2] || row.valor || row.Valor || row.VALOR || row.amount || row.Amount;
      
      if (date && description && amountStr !== undefined) {
        let parsedDate: string;
        try {
          // Tentar diferentes formatos de data
          if (typeof date === 'string') {
            const dateFormats = [
              /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
              /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
              /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
            ];
            
            if (dateFormats[0].test(date)) {
              parsedDate = date;
            } else if (dateFormats[1].test(date)) {
              const [day, month, year] = date.split('/');
              parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            } else if (dateFormats[2].test(date)) {
              const [day, month, year] = date.split('-');
              parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            } else {
              parsedDate = new Date(date).toISOString().split('T')[0];
            }
          } else {
            parsedDate = new Date(date).toISOString().split('T')[0];
          }
        } catch {
          parsedDate = new Date().toISOString().split('T')[0];
        }
        
        // Processar valor - sempre trabalhar com valores absolutos
        let amount = 0;
        if (typeof amountStr === 'number') {
          amount = Math.abs(amountStr);
        } else if (typeof amountStr === 'string') {
          const cleanValue = amountStr.replace(/[^\d.,-]/g, '').replace(',', '.');
          amount = Math.abs(parseFloat(cleanValue));
        }
        
        if (!isNaN(amount) && amount > 0) {
          const categorization = categorizeTransaction(String(description));
          
          const transaction: PendingTransaction = {
            id: `pending-${Date.now()}-${index}`,
            date: parsedDate,
            description: String(description),
            amount: amount,
            suggestedCategory: categorization.category,
            suggestedSubcategory: categorization.subcategory,
            suggestedType: categorization.type
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

    if (!selectedAccount && !newAccountName) {
      toast({
        title: "Erro",
        description: "Selecione uma conta ou crie uma nova",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      let fileData: any[] = [];
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        const dataLines = lines.slice(1); // Pular cabeçalho
        
        fileData = dataLines.map(line => {
          const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
          return columns;
        });
      } else if (file.name.endsWith('.xlsx')) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        fileData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).slice(1); // Pular cabeçalho
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        const dataLines = lines.slice(1); // Pular cabeçalho
        
        fileData = dataLines.map(line => {
          // Assumir separação por tab ou múltiplos espaços
          const columns = line.split(/\t|\s{2,}/).map(col => col.trim());
          return columns;
        });
      } else {
        throw new Error('Formato de arquivo não suportado. Use CSV, XLSX ou TXT.');
      }
      
      const pendingTransactions = parseFile(fileData, file.name);
      
      if (pendingTransactions.length === 0) {
        throw new Error('Nenhuma transação válida encontrada no arquivo.');
      }

      // Determinar conta final
      let finalAccount = selectedAccount;
      if (newAccountName && !selectedAccount) {
        const newAccount = addAccount({ name: newAccountName });
        finalAccount = newAccount.id;
      }
      
      onPendingTransactions(pendingTransactions, finalAccount, selectedMonth, selectedYear);
      
      setIsOpen(false);
      setSelectedAccount("");
      setNewAccountName("");
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
        <div className="space-y-6">
          {/* Seleção de Conta */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="account-select">Conta Bancária</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta existente" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-px bg-border flex-1" />
              <span className="text-sm text-muted-foreground">ou</span>
              <div className="h-px bg-border flex-1" />
            </div>
            
            <div>
              <Label htmlFor="new-account">Nova Conta</Label>
              <Input
                id="new-account"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Nome da nova conta"
              />
            </div>
          </div>

          {/* Seleção de Mês e Ano */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month-select">Mês de Apuração</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="year-select">Ano de Apuração</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload de Arquivo */}
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Selecione um arquivo do seu extrato bancário
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.txt"
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
                <p className="font-medium mb-2">Formato esperado:</p>
                <p className="text-muted-foreground">
                  <strong>3 colunas:</strong> Data, Lançamento (Descrição), Valor
                </p>
                <p className="text-muted-foreground mt-1">
                  <strong>Formatos aceitos:</strong> CSV, XLSX, TXT
                </p>
                <p className="text-muted-foreground mt-1">
                  As transações serão categorizadas automaticamente e você poderá revisar antes de confirmar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};