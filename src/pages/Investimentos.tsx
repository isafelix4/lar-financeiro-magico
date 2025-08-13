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
import InvestmentReturnUpdater from "@/components/dashboard/InvestmentReturnUpdater";
import { generateDistinctiveColors } from "@/lib/colorUtils";
const INVESTMENT_TYPES = ['Renda Fixa (CDB, Tesouro Direto)', 'Fundo Imobiliário (FII)', 'Ações', 'ETF', 'Criptomoeda', 'Moeda Internacional', 'Previdência Privada', 'Outros'];
const Investimentos = () => {
  const {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    updateInvestmentReturn,
    transactions,
    investmentReturns
  } = useFinancialData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Investment;
    direction: 'asc' | 'desc';
  } | null>(null);
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

  // Calculate KPIs using current values
  const valorTotalAtualizado = investments.reduce((sum, inv) => sum + inv.valorAtualizado, 0);
  const valorTotalAportado = investments.reduce((sum, inv) => sum + inv.valorAportado, 0);
  const rentabilidadeMedia = investments.length > 0 ? investments.reduce((sum, inv) => sum + inv.rentabilidadeMensal * (inv.valorAportado / valorTotalAportado), 0) : 0;

  // Calculate monthly investment contributions from current month transactions
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const aporteDoMes = transactions.filter(t => t.category === 'Transferências' && t.subcategory === 'Investimentos' && t.month === currentMonth && t.year === currentYear && t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);

  // Prepare chart data by type with indicators
  const chartDataByType = investments.reduce((acc, inv) => {
    const existingType = acc.find(item => item.tipo === inv.tipoInvestimento);
    if (existingType) {
      existingType.valor += inv.valorAtualizado;
      existingType.aporte += inv.valorAportado;
      existingType.indicadores[inv.indicadorAtrelado || 'Sem indicador'] = (existingType.indicadores[inv.indicadorAtrelado || 'Sem indicador'] || 0) + inv.valorAtualizado;
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

  // Monthly evolution data for last 12 months (snapshots)
  const monthlyEvolution = [] as Array<{
    mes: string;
    totalAportadoAcumulado: number;
    variacaoLiquidaMes: number;
    aportesMes: number;
    resgatesMes: number;
    retornosManuaisMes: number;
  }>;
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = target.getMonth() + 1;
    const year = target.getFullYear();
    const nextMonthStart = new Date(year, month, 1);

    // Base: total aportado acumulado até o início do mês (aportes iniciais + adicionais anteriores)
    const initialAportesBefore = investments.reduce((sum, inv) => {
      const invDate = new Date(inv.dataPrimeiroAporte);
      return invDate < target ? sum + inv.valorAportado : sum;
    }, 0);
    const additionalAportesBefore = transactions.filter(t => t.category === 'Transferências' && t.subcategory === 'Investimentos' && t.type === 'despesa' && (t.year < year || t.year === year && t.month < month)).reduce((s, t) => s + t.amount, 0);
    const totalAportadoAcumulado = initialAportesBefore + additionalAportesBefore;

    // Topo: variação líquida do mês = aportes + retornos manuais - resgates
    const aportesMes = transactions.filter(t => t.category === 'Transferências' && t.subcategory === 'Investimentos' && t.type === 'despesa' && t.month === month && t.year === year).reduce((s, t) => s + t.amount, 0);
    const resgatesMes = transactions.filter(t => t.category === 'Variável' && t.subcategory === 'Investimentos' && t.type === 'receita' && t.month === month && t.year === year).reduce((s, t) => s + t.amount, 0);
    const retornosManuaisMes = investmentReturns.filter(ev => {
      const d = new Date(ev.date);
      return d >= target && d < nextMonthStart;
    }).reduce((s, ev) => s + ev.amount, 0);
    const variacaoLiquidaMes = aportesMes + retornosManuaisMes - resgatesMes;
    const monthNames = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
    const formattedDate = `${monthNames[month - 1]} de ${year}`;
    monthlyEvolution.push({
      mes: formattedDate,
      totalAportadoAcumulado: Math.max(0, totalAportadoAcumulado),
      variacaoLiquidaMes,
      aportesMes,
      resgatesMes,
      retornosManuaisMes
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
      dataPrimeiroAporte: formData.dataPrimeiroAporte
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
    setSortConfig({
      key,
      direction
    });
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
  return <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Investimentos</h1>
        <div className="flex gap-2">
          <InvestmentReturnUpdater investments={investments} onUpdateReturn={updateInvestmentReturn} />
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
                  <Input id="nome" value={formData.nome} onChange={e => setFormData({
                  ...formData,
                  nome: e.target.value
                })} placeholder="Ex: Itaú Unibanco PN" />
                </div>
                
                <div>
                  <Label htmlFor="tipoInvestimento">Tipo de Investimento *</Label>
                  <Select value={formData.tipoInvestimento} onValueChange={value => setFormData({
                  ...formData,
                  tipoInvestimento: value
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTMENT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valorAportado">Valor Aportado *</Label>
                    <Input id="valorAportado" type="number" step="0.01" value={formData.valorAportado} onChange={e => setFormData({
                    ...formData,
                    valorAportado: e.target.value
                  })} placeholder="0,00" />
                  </div>
                  
                  <div>
                    <Label htmlFor="valorAtualizado">Valor Atualizado</Label>
                    <Input id="valorAtualizado" type="number" step="0.01" value={formData.valorAtualizado} onChange={e => setFormData({
                    ...formData,
                    valorAtualizado: e.target.value
                  })} placeholder="0,00" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rentabilidadeMensal">Rentabilidade/Taxa ao mês (%)</Label>
                    <Input id="rentabilidadeMensal" type="number" step="0.01" value={formData.rentabilidadeMensal} onChange={e => setFormData({
                    ...formData,
                    rentabilidadeMensal: e.target.value
                  })} placeholder="0,00" />
                  </div>
                  
                  <div>
                    <Label htmlFor="indicadorAtrelado">Indicador Atrelado</Label>
                    <Input id="indicadorAtrelado" value={formData.indicadorAtrelado} onChange={e => setFormData({
                    ...formData,
                    indicadorAtrelado: e.target.value
                  })} placeholder="Ex: CDI, IPCA, IBOV" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="corretora">Corretora/Instituição *</Label>
                    <Input id="corretora" value={formData.corretora} onChange={e => setFormData({
                    ...formData,
                    corretora: e.target.value
                  })} placeholder="Ex: XP Investimentos" />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataPrimeiroAporte">Data do Primeiro Aporte *</Label>
                    <Input id="dataPrimeiroAporte" type="date" value={formData.dataPrimeiroAporte} onChange={e => setFormData({
                    ...formData,
                    dataPrimeiroAporte: e.target.value
                  })} />
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
      </div>

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
              {new Date().toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric'
            })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
            <p className="text-xs text-muted-foreground">investimentos ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart - Full Width */}
      

      {/* Composition Chart - Full Width */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Composição da Carteira por Tipo de Investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartDataByType} cx="50%" cy="50%" outerRadius={120} fill="#8884d8" dataKey="valor">
                      {chartDataByType.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => {
                    const indicadores = props.payload.indicadores;
                    const total = Number(value);
                    const percentage = (total / valorTotalAtualizado * 100).toFixed(1);
                    return [<div key="tooltip">
                            <div>{formatCurrency(total)} ({percentage}%)</div>
                            <div className="mt-2 text-sm">
                              <strong>Detalhamento por Indicador:</strong>
                              {Object.entries(indicadores).map(([indicador, valor]) => <div key={indicador}>
                                  {indicador}: {formatCurrency(Number(valor))} ({(Number(valor) / total * 100).toFixed(1)}%)
                                </div>)}
                            </div>
                          </div>, props.payload.tipo];
                  }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">Tipos de Investimento</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {chartDataByType.map((item, index) => {
                const percentage = (item.valor / valorTotalAtualizado * 100).toFixed(1);
                return <div key={item.tipo} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{
                    backgroundColor: COLORS[index % COLORS.length]
                  }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.tipo}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.valor)} ({percentage}%)
                        </p>
                      </div>
                    </div>;
              })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('nome')} className="h-auto p-0 font-semibold">
                      Nome do Ativo
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('tipoInvestimento')} className="h-auto p-0 font-semibold">
                      Tipo
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('valorAportado')} className="h-auto p-0 font-semibold">
                      Valor Aportado
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('valorAtualizado')} className="h-auto p-0 font-semibold">
                      Valor Atualizado
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('rentabilidadeMensal')} className="h-auto p-0 font-semibold">
                      Rentabilidade
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead>Corretora</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvestments.map(investment => <TableRow key={investment.id}>
                    <TableCell className="font-medium">{investment.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{investment.tipoInvestimento}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(investment.valorAportado)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatCurrency(investment.valorAtualizado)}</span>
                        <span className={`text-xs ${investment.valorAtualizado >= investment.valorAportado ? 'text-green-600' : 'text-red-600'}`}>
                          {investment.valorAtualizado >= investment.valorAportado ? '+' : ''}
                          {formatCurrency(investment.valorAtualizado - investment.valorAportado)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{investment.rentabilidadeMensal.toFixed(2)}%</TableCell>
                    <TableCell>{investment.indicadorAtrelado || '-'}</TableCell>
                    <TableCell>{investment.corretora}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(investment)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(investment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Investimentos;