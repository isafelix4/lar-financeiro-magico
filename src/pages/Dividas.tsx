import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, ArrowUpDown, TrendingDown, Calculator, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DebtEvolutionChart } from "@/components/dashboard/DebtEvolutionChart";
import type { Debt } from "@/types/financial";
import { useFinancialData } from "@/hooks/useFinancialData";

const Dividas = () => {
  const [dividas, setDividas] = useState<Debt[]>(() => {
    const stored = localStorage.getItem('financial-dividas');
    const dividasData = stored ? JSON.parse(stored) : [];
    
    // Apply interest calculation only once per month
    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${today.getMonth()}`;
    const lastInterestCalculation = localStorage.getItem('last-interest-calculation');
    
    if (lastInterestCalculation !== currentMonthKey && dividasData.length > 0) {
      const updatedDividas = dividasData.map((divida: Debt) => {
        if (divida.parcelasRestantes > 0 && divida.saldoDevedor > 0) {
          const juros = divida.saldoDevedor * (divida.taxaJuros / 100);
          return {
            ...divida,
            saldoDevedor: divida.saldoDevedor + juros
          };
        }
        return divida;
      });
      
      localStorage.setItem('financial-dividas', JSON.stringify(updatedDividas));
      localStorage.setItem('last-interest-calculation', currentMonthKey);
      return updatedDividas;
    }
    
    return dividasData;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDivida, setEditingDivida] = useState<Debt | null>(null);
  const [sortField, setSortField] = useState<keyof Debt | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();
  const { transactions } = useFinancialData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddDivida = (formData: FormData) => {
    const novaDivida: Debt = {
      id: Date.now().toString(),
      credor: formData.get('credor') as string,
      descricao: formData.get('descricao') as string,
      valorInicial: parseFloat(formData.get('valorInicial') as string),
      valorAtual: parseFloat(formData.get('valorAtual') as string),
      taxaJuros: parseFloat(formData.get('taxaJuros') as string),
      valorParcela: parseFloat(formData.get('valorParcela') as string),
      parcelasRestantes: parseInt(formData.get('parcelasRestantes') as string),
      saldoDevedor: parseFloat(formData.get('saldoDevedor') as string),
      dataInicio: formData.get('dataInicio') as string,
      status: 'Em dia',
    };

    setDividas(prev => [...prev, novaDivida]);
    setIsDialogOpen(false);
    
    toast({
      title: "Dívida adicionada!",
      description: `Dívida com ${novaDivida.credor} foi adicionada com sucesso.`,
    });
  };

  const handleEditDivida = (formData: FormData) => {
    if (!editingDivida) return;

    const dividaAtualizada: Debt = {
      ...editingDivida,
      credor: formData.get('credor') as string,
      descricao: formData.get('descricao') as string,
      valorInicial: parseFloat(formData.get('valorInicial') as string),
      valorAtual: parseFloat(formData.get('valorAtual') as string),
      taxaJuros: parseFloat(formData.get('taxaJuros') as string),
      valorParcela: parseFloat(formData.get('valorParcela') as string),
      parcelasRestantes: parseInt(formData.get('parcelasRestantes') as string),
      saldoDevedor: parseFloat(formData.get('saldoDevedor') as string),
      dataInicio: formData.get('dataInicio') as string,
      status: formData.get('status') as 'Em dia' | 'Em atraso' | 'Suspensa',
    };

    setDividas(prev => prev.map(d => d.id === editingDivida.id ? dividaAtualizada : d));
    setEditingDivida(null);
    
    toast({
      title: "Dívida atualizada!",
      description: `Dívida com ${dividaAtualizada.credor} foi atualizada com sucesso.`,
    });
  };

  const handleDeleteDivida = (dividaId: string) => {
    const divida = dividas.find(d => d.id === dividaId);
    setDividas(prev => prev.filter(d => d.id !== dividaId));
    
    toast({
      title: "Dívida removida!",
      description: `Dívida com ${divida?.credor} foi removida com sucesso.`,
    });
  };

  // Função para processar pagamento de dívida (será chamada pelo hook useFinancialData)
  const processarPagamentoDivida = (dividaId: string, valorPagamento: number) => {
    setDividas(prev => prev.map(divida => {
      if (divida.id === dividaId && divida.parcelasRestantes > 0) {
        return {
          ...divida,
          saldoDevedor: Math.max(0, divida.saldoDevedor - valorPagamento),
          parcelasRestantes: Math.max(0, divida.parcelasRestantes - 1)
        };
      }
      return divida;
    }));
  };

  const handleSort = (field: keyof Debt) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedDividas = [...dividas].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  // Calculate debt payments from current month transactions
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const monthlyDebtPayments = transactions
    .filter(t => 
      t.category === 'Dívidas' && 
      t.month === currentMonth && 
      t.year === currentYear
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaldoDevedor = dividas.reduce((sum, divida) => sum + divida.saldoDevedor, 0);
  const mediaTaxaJuros = dividas.length > 0 
    ? dividas.reduce((sum, divida) => sum + divida.taxaJuros, 0) / dividas.length 
    : 0;

  // Persistir no localStorage
  useEffect(() => {
    localStorage.setItem('financial-dividas', JSON.stringify(dividas));
  }, [dividas]);

  // Escutar eventos de pagamento de dívidas
  useEffect(() => {
    const handleDebtPayment = (event: CustomEvent) => {
      const { debtId, paymentAmount } = event.detail;
      processarPagamentoDivida(debtId, paymentAmount);
    };

    window.addEventListener('debt-payment', handleDebtPayment as EventListener);
    
    return () => {
      window.removeEventListener('debt-payment', handleDebtPayment as EventListener);
    };
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Mapa de Dívidas</h1>
        <Dialog open={isDialogOpen || !!editingDivida} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingDivida(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Dívida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDivida ? 'Editar Dívida' : 'Adicionar Nova Dívida'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (editingDivida) {
                handleEditDivida(formData);
              } else {
                handleAddDivida(formData);
              }
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credor">Credor</Label>
                  <Input 
                    id="credor" 
                    name="credor" 
                    defaultValue={editingDivida?.credor || ''} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input 
                    id="descricao" 
                    name="descricao" 
                    defaultValue={editingDivida?.descricao || ''} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorInicial">Valor Inicial</Label>
                  <Input 
                    id="valorInicial" 
                    name="valorInicial" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingDivida?.valorInicial || ''} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorAtual">Valor Total Atualizado</Label>
                  <Input 
                    id="valorAtual" 
                    name="valorAtual" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingDivida?.valorAtual || ''} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxaJuros">Taxa de Juros (% a.m.)</Label>
                  <Input 
                    id="taxaJuros" 
                    name="taxaJuros" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingDivida?.taxaJuros || ''} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorParcela">Valor da Parcela</Label>
                  <Input 
                    id="valorParcela" 
                    name="valorParcela" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingDivida?.valorParcela || ''} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcelasRestantes">Parcelas Restantes</Label>
                  <Input 
                    id="parcelasRestantes" 
                    name="parcelasRestantes" 
                    type="number" 
                    defaultValue={editingDivida?.parcelasRestantes || ''} 
                    required 
                  />
                </div>
                  <div className="space-y-2">
                    <Label htmlFor="saldoDevedor">Saldo Devedor</Label>
                    <Input 
                      id="saldoDevedor" 
                      name="saldoDevedor" 
                      type="number" 
                      step="0.01" 
                      defaultValue={editingDivida?.saldoDevedor || ''} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Input 
                      id="dataInicio" 
                      name="dataInicio" 
                      type="date" 
                      defaultValue={editingDivida?.dataInicio || ''} 
                      required 
                    />
                  </div>
                  {editingDivida && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select 
                        id="status" 
                        name="status" 
                        defaultValue={editingDivida?.status || 'Em dia'}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="Em dia">Em dia</option>
                        <option value="Em atraso">Em atraso</option>
                        <option value="Suspensa">Suspensa</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <Button type="submit" className="w-full">
                  {editingDivida ? 'Atualizar Dívida' : 'Adicionar Dívida'}
                </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs das Dívidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-danger">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Devedor Total</CardTitle>
            <Calculator className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{formatCurrency(totalSaldoDevedor)}</div>
            <p className="text-xs text-muted-foreground">
              {dividas.length} dívida(s) ativa(s)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Média de Juros</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{mediaTaxaJuros.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Por mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redução Mensal</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(monthlyDebtPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor pago no mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Dívida Total e Quantidade de Dívidas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <DebtEvolutionChart debts={dividas} />
        </CardContent>
      </Card>

      {/* Tabela de Dívidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Controle de Dívidas
            <span className="text-sm text-muted-foreground ml-2">
              (Clique no cabeçalho para ordenar)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dividas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma dívida cadastrada.</p>
              <p className="text-sm">Clique em "Nova Dívida" para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted" 
                      onClick={() => handleSort('credor')}
                    >
                      <div className="flex items-center gap-1">
                        Credor
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted" 
                      onClick={() => handleSort('valorInicial')}
                    >
                      <div className="flex items-center gap-1">
                        Valor Inicial
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted" 
                      onClick={() => handleSort('valorAtual')}
                    >
                      <div className="flex items-center gap-1">
                        Valor Total Atualizado
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted" 
                      onClick={() => handleSort('taxaJuros')}
                    >
                      <div className="flex items-center gap-1">
                        Taxa de Juros (% a.m.)
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted" 
                      onClick={() => handleSort('valorParcela')}
                    >
                      <div className="flex items-center gap-1">
                        Valor da Parcela
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted" 
                      onClick={() => handleSort('parcelasRestantes')}
                    >
                      <div className="flex items-center gap-1">
                        Parcelas Restantes
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted" 
                      onClick={() => handleSort('saldoDevedor')}
                    >
                      <div className="flex items-center gap-1">
                        Saldo Devedor
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted" 
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDividas.map((divida) => (
                    <TableRow key={divida.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{divida.credor}</TableCell>
                      <TableCell>{divida.descricao}</TableCell>
                      <TableCell>{formatCurrency(divida.valorInicial)}</TableCell>
                      <TableCell>{formatCurrency(divida.valorAtual)}</TableCell>
                      <TableCell className="text-danger font-medium">{divida.taxaJuros}%</TableCell>
                      <TableCell>{formatCurrency(divida.valorParcela)}</TableCell>
                      <TableCell>{divida.parcelasRestantes}x</TableCell>
                      <TableCell className="font-bold text-danger">
                        {formatCurrency(divida.saldoDevedor)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          divida.status === 'Em dia' 
                            ? 'bg-success/10 text-success' 
                            : divida.status === 'Em atraso'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {divida.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingDivida(divida)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a dívida com {divida.credor}? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDivida(divida.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
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

export default Dividas;