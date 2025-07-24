import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, ArrowUpDown, TrendingDown, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Divida {
  id: string;
  credor: string;
  descricao: string;
  valorInicial: number;
  valorAtual: number;
  taxaJuros: number;
  valorParcela: number;
  parcelasRestantes: number;
  saldoDevedor: number;
}

const Dividas = () => {
  const [dividas, setDividas] = useState<Divida[]>(() => {
    const stored = localStorage.getItem('financial-dividas');
    return stored ? JSON.parse(stored) : [];
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof Divida | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddDivida = (formData: FormData) => {
    const novaDivida: Divida = {
      id: Date.now().toString(),
      credor: formData.get('credor') as string,
      descricao: formData.get('descricao') as string,
      valorInicial: parseFloat(formData.get('valorInicial') as string),
      valorAtual: parseFloat(formData.get('valorAtual') as string),
      taxaJuros: parseFloat(formData.get('taxaJuros') as string),
      valorParcela: parseFloat(formData.get('valorParcela') as string),
      parcelasRestantes: parseInt(formData.get('parcelasRestantes') as string),
      saldoDevedor: parseFloat(formData.get('saldoDevedor') as string),
    };

    setDividas(prev => [...prev, novaDivida]);
    setIsDialogOpen(false);
    
    toast({
      title: "Dívida adicionada!",
      description: `Dívida com ${novaDivida.credor} foi adicionada com sucesso.`,
    });
  };

  const handleSort = (field: keyof Divida) => {
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

  const totalSaldoDevedor = dividas.reduce((sum, divida) => sum + divida.saldoDevedor, 0);
  const mediaTaxaJuros = dividas.length > 0 
    ? dividas.reduce((sum, divida) => sum + divida.taxaJuros, 0) / dividas.length 
    : 0;

  // Dados calculados para o gráfico de evolução baseados nas dívidas reais
  const evolucaoDivida = dividas.length > 0 
    ? [{ mes: 'Atual', total: totalSaldoDevedor }]
    : [];

  // Persistir no localStorage
  useEffect(() => {
    localStorage.setItem('financial-dividas', JSON.stringify(dividas));
  }, [dividas]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Mapa de Dívidas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Dívida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Dívida</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddDivida(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credor">Credor</Label>
                  <Input id="credor" name="credor" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input id="descricao" name="descricao" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorInicial">Valor Inicial</Label>
                  <Input id="valorInicial" name="valorInicial" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorAtual">Valor Total Atualizado</Label>
                  <Input id="valorAtual" name="valorAtual" type="number" step="0.01" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxaJuros">Taxa de Juros (% a.m.)</Label>
                  <Input id="taxaJuros" name="taxaJuros" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorParcela">Valor da Parcela</Label>
                  <Input id="valorParcela" name="valorParcela" type="number" step="0.01" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcelasRestantes">Parcelas Restantes</Label>
                  <Input id="parcelasRestantes" name="parcelasRestantes" type="number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saldoDevedor">Saldo Devedor</Label>
                  <Input id="saldoDevedor" name="saldoDevedor" type="number" step="0.01" required />
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Adicionar Dívida
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
              {formatCurrency(dividas.reduce((sum, divida) => sum + divida.valorParcela, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Total parcelas mensais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Dívida Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoDivida}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Total das Dívidas']}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--danger))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--danger))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
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