import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Investment } from "@/types/financial";
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import InvestmentFilters from "@/components/dashboard/InvestmentFilters";
import InvestmentReturnUpdater from "@/components/dashboard/InvestmentReturnUpdater";
import { generateDistinctiveColors } from "@/lib/colorUtils";

const INVESTMENT_TYPES = [
  'Renda Fixa (CDB, Tesouro Direto)',
  'Fundo Imobiliário (FII)',
  'Ações',
  'ETF',
  'Criptomoeda',
  'Moeda Internacional',
  'Previdência Privada',
  'Outros'
];


const Investimentos = () => {
  const { investments, addInvestment, updateInvestment, deleteInvestment, updateInvestmentReturn, transactions } = useFinancialData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Investment; direction: 'asc' | 'desc' } | null>(null);
  
  // Filtros de período
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [formData, setFormData] = useState({
    nome: '',
    tipoInvestimento: '',
    valorAportado: '',
    valorAtualizado: '',
    rentabilidadeMensal: '',
    indicadorAtrelado: '',
    corretora: '',
    dataPrimeiroAporte: ''
  });

  // Calculate KPIs based on selected filters (snapshot logic)
  const getSnapshotForPeriod = (month: number, year: number) => {
    return investments.reduce((acc, inv) => {
      const snapshot = inv.snapshotsmensais?.find(s => s.mes === month && s.ano === year);
      if (snapshot) {
        acc.valorTotalAtualizado += snapshot.valorTotalAtualizado;
        acc.valorTotalInvestido += snapshot.valorTotalInvestido;
        acc.ganhoCapitalTotal += snapshot.ganhoCapitalMes;
      } else {
        // Se não há snapshot, usar valores base
        acc.valorTotalAtualizado += inv.valorAtualizado;
        acc.valorTotalInvestido += inv.valorAportado;
      }
      return acc;
    }, { valorTotalAtualizado: 0, valorTotalInvestido: 0, ganhoCapitalTotal: 0 });
  };

  const snapshotAtual = getSnapshotForPeriod(selectedMonth, selectedYear);
  const valorTotalAtualizado = snapshotAtual.valorTotalAtualizado;
  const valorTotalAportado = investments.reduce((sum, inv) => sum + inv.valorAportado, 0);
  
  const rentabilidadeMedia = investments.length > 0 
    ? investments.reduce((sum, inv) => sum + (inv.rentabilidadeMensal * (inv.valorAportado / valorTotalAportado)), 0)
    : 0;

  // Calculate monthly investment contributions from transactions (filtered)
  const aporteDoMes = transactions
    .filter(t => 
      t.category === 'Transferências' && 
      t.subcategory === 'Investimentos' &&
      t.month === selectedMonth && 
      t.year === selectedYear &&
      t.type === 'despesa'
    )
    .reduce((sum, t) => sum + t.amount, 0);

  // Prepare chart data by type with indicators
  const chartDataByType = investments.reduce((acc, inv) => {
    const existingType = acc.find(item => item.tipo === inv.tipoInvestimento);
    if (existingType) {
      existingType.valor += inv.valorAtualizado;
      existingType.aporte += inv.valorAportado;
      existingType.indicadores[inv.indicadorAtrelado || 'Sem indicador'] = 
        (existingType.indicadores[inv.indicadorAtrelado || 'Sem indicador'] || 0) + inv.valorAtualizado;
    } else {
      acc.push({
        tipo: inv.tipoInvestimento,
        valor: inv.valorAtualizado,
        aporte: inv.valorAportado,
        ganho: inv.valorAtualizado - inv.valorAportado,
        indicadores: {
          [inv.indicadorAtrelado || 'Sem indicador']: inv.valorAtualizado
        }
      });
    }
    return acc;
  }, [] as Array<{ 
    tipo: string; 
    valor: number; 
    aporte: number; 
    ganho: number;
    indicadores: Record<string, number>;
  }>);

  // Generate distinctive colors for chart
  const COLORS = generateDistinctiveColors(chartDataByType.length);

  // Monthly evolution data using snapshots - 12 months with stacked bars
  const monthlyEvolution = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // Aportes do mês
    const aportesMes = transactions
      .filter(t => 
        t.category === 'Transferências' && 
        t.subcategory === 'Investimentos' &&
        t.month === month && 
        t.year === year &&
        t.type === 'despesa'
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Resgates do mês
    const resgatesMes = transactions
      .filter(t => 
        t.category === 'Variável' && 
        t.subcategory === 'Investimentos' &&
        t.month === month && 
        t.year === year &&
        t.type === 'receita'
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Obter snapshot do mês ou calcular
    const snapshotMes = getSnapshotForPeriod(month, year);
    
    // Valor do mês anterior (para calcular base)
    const mesAnterior = month === 1 ? 12 : month - 1;
    const anoAnterior = month === 1 ? year - 1 : year;
    const snapshotAnterior = getSnapshotForPeriod(mesAnterior, anoAnterior);
    
    // Calcular Valor Total Investido conforme fórmula solicitada:
    // Valor Total Atualizado do mês anterior + Novos Aportes do mês - Resgates realizados no mês
    const valorTotalInvestido = snapshotAnterior.valorTotalAtualizado + aportesMes - resgatesMes;
    
    // Ganho de Capital do mês
    const ganhoCapitalMes = snapshotMes.valorTotalAtualizado - valorTotalInvestido;

    const monthNames = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
    const formattedDate = `${monthNames[month - 1]} de ${year}`;

    monthlyEvolution.push({
      mes: formattedDate,
      valorTotalInvestido: Math.max(0, valorTotalInvestido),
      ganhoCapitalTotal: Math.max(0, ganhoCapitalMes),
      aportesMes,
      resgatesMes
    });
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.tipoInvestimento || !formData.valorAportado || !formData.corretora || !formData.dataPrimeiroAporte) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const investmentData: Omit<Investment, 'id'> = {
      nome: formData.nome,
      tipoInvestimento: formData.tipoInvestimento,
      valorAportado: parseFloat(formData.valorAportado) || 0,
      valorAtualizado: parseFloat(formData.valorAtualizado) || parseFloat(formData.valorAportado) || 0,
      rentabilidadeMensal: parseFloat(formData.rentabilidadeMensal) || 0,
      indicadorAtrelado: formData.indicadorAtrelado,
      corretora: formData.corretora,
      dataPrimeiroAporte: formData.dataPrimeiroAporte,
    };

    if (editingInvestment) {
      updateInvestment(editingInvestment.id, investmentData);
      toast.success('Investimento atualizado com sucesso!');
    } else {
      addInvestment(investmentData);
      toast.success('Investimento adicionado com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipoInvestimento: '',
      valorAportado: '',
      valorAtualizado: '',
      rentabilidadeMensal: '',
      indicadorAtrelado: '',
      corretora: '',
      dataPrimeiroAporte: ''
    });
    setEditingInvestment(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      nome: investment.nome,
      tipoInvestimento: investment.tipoInvestimento,
      valorAportado: investment.valorAportado.toString(),
      valorAtualizado: investment.valorAtualizado.toString(),
      rentabilidadeMensal: investment.rentabilidadeMensal.toString(),
      indicadorAtrelado: investment.indicadorAtrelado || '',
      corretora: investment.corretora,
      dataPrimeiroAporte: investment.dataPrimeiroAporte
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este investimento?')) {
      deleteInvestment(id);
      toast.success('Investimento excluído com sucesso!');
    }
  };

  const handleSort = (key: keyof Investment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedInvestments = [...investments].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (sortConfig.direction === 'asc') {
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    } else {
      return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Investimentos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Investimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Ativo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Itaú Unibanco PN"
                />
              </div>
              
              <div>
                <Label htmlFor="tipoInvestimento">Tipo de Investimento *</Label>
                <Select value={formData.tipoInvestimento} onValueChange={(value) => setFormData({ ...formData, tipoInvestimento: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valorAportado">Valor Aportado *</Label>
                  <Input
                    id="valorAportado"
                    type="number"
                    step="0.01"
                    value={formData.valorAportado}
                    onChange={(e) => setFormData({ ...formData, valorAportado: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="valorAtualizado">Valor Atualizado</Label>
                  <Input
                    id="valorAtualizado"
                    type="number"
                    step="0.01"
                    value={formData.valorAtualizado}
                    onChange={(e) => setFormData({ ...formData, valorAtualizado: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rentabilidadeMensal">Rentabilidade/Taxa ao mês (%)</Label>
                  <Input
                    id="rentabilidadeMensal"
                    type="number"
                    step="0.01"
                    value={formData.rentabilidadeMensal}
                    onChange={(e) => setFormData({ ...formData, rentabilidadeMensal: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="indicadorAtrelado">Indicador Atrelado</Label>
                  <Input
                    id="indicadorAtrelado"
                    value={formData.indicadorAtrelado}
                    onChange={(e) => setFormData({ ...formData, indicadorAtrelado: e.target.value })}
                    placeholder="Ex: CDI, IPCA, IBOV"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="corretora">Corretora/Instituição *</Label>
                  <Input
                    id="corretora"
                    value={formData.corretora}
                    onChange={(e) => setFormData({ ...formData, corretora: e.target.value })}
                    placeholder="Ex: XP Investimentos"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dataPrimeiroAporte">Data do Primeiro Aporte *</Label>
                  <Input
                    id="dataPrimeiroAporte"
                    type="date"
                    value={formData.dataPrimeiroAporte}
                    onChange={(e) => setFormData({ ...formData, dataPrimeiroAporte: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingInvestment ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <InvestmentFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Atualizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(valorTotalAtualizado)}</div>
            <p className="text-xs text-muted-foreground">
              Ganho: {formatCurrency(valorTotalAtualizado - valorTotalAportado)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade Média da Carteira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rentabilidadeMedia.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">ao mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aporte do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(aporteDoMes)}</div>
            <p className="text-xs text-muted-foreground">
              {selectedMonth.toString().padStart(2, '0')}/{selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controle</CardTitle>
          </CardHeader>
          <CardContent>
            <InvestmentReturnUpdater
              investments={investments}
              onUpdateReturn={updateInvestmentReturn}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal dos Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={monthlyEvolution}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="mes" />
                   <YAxis tickFormatter={(value) => formatCurrency(value)} />
                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
                   <Legend />
                   <Bar dataKey="valorTotalInvestido" stackId="a" fill="hsl(var(--chart-1))" name="Valor Total Investido" />
                   <Bar dataKey="ganhoCapitalTotal" stackId="a" fill="hsl(var(--chart-2))" name="Ganho de Capital Total" />
                 </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Composition */}
        <Card>
          <CardHeader>
            <CardTitle>Composição da Carteira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartDataByType}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {chartDataByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name, props) => {
                          const entry = props.payload;
                          if (!entry) return [formatCurrency(value), name];
                          
                          const indicadores = entry.indicadores || {};
                          const total = entry.valor || 0;
                          
                          const lines = [
                            `Total: ${formatCurrency(total)}`
                          ];
                          
                          // Add indicator breakdown
                          Object.entries(indicadores).forEach(([indicator, amount]) => {
                            const percentage = total > 0 ? ((amount as number / total) * 100).toFixed(1) : 0;
                            lines.push(`${indicator}: ${formatCurrency(amount as number)} (${percentage}%)`);
                          });
                          
                          return lines;
                        }}
                        labelFormatter={(value) => `Tipo: ${value}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Tipos de Investimento</h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {chartDataByType.map((item, index) => (
                      <div 
                        key={item.tipo}
                        className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.tipo}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.valor)} ({((item.valor / valorTotalAtualizado) * 100).toFixed(1)}%)
                          </p>
                          <div className="mt-1 space-y-1">
                            {Object.entries(item.indicadores).map(([indicator, amount]) => (
                              <p key={indicator} className="text-xs text-muted-foreground ml-2">
                                • {indicator}: {formatCurrency(amount as number)}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('nome')}>
                    <div className="flex items-center gap-1">
                      Nome do Ativo
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('tipoInvestimento')}>
                    <div className="flex items-center gap-1">
                      Tipo
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('valorAportado')}>
                    <div className="flex items-center gap-1">
                      Valor Aportado
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('valorAtualizado')}>
                    <div className="flex items-center gap-1">
                      Valor Atualizado
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Rentabilidade</TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead>Corretora</TableHead>
                  <TableHead>Data Aporte</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvestments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell className="font-medium">{investment.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{investment.tipoInvestimento}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(investment.valorAportado)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(investment.valorAtualizado)}
                    </TableCell>
                    <TableCell>{investment.rentabilidadeMensal.toFixed(2)}%</TableCell>
                    <TableCell>{investment.indicadorAtrelado || '-'}</TableCell>
                    <TableCell>{investment.corretora}</TableCell>
                    <TableCell>
                      {new Date(investment.dataPrimeiroAporte).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(investment)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(investment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {investments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum investimento cadastrado. Clique em "Novo Investimento" para começar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Investimentos;