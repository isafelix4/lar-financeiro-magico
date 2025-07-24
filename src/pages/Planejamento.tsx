import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, DollarSign, TrendingUp, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFinancialData } from "@/hooks/useFinancialData";

interface RendaSource {
  id: string;
  nome: string;
  valor: number;
  restricao?: string; // Para vale-alimentação, vale-transporte, etc.
}

const Planejamento = () => {
  const { categories, budgetItems, transactions, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useFinancialData();
  const { toast } = useToast();

  const [rendas, setRendas] = useState<RendaSource[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Cálculos
  const rendaTotal = rendas.reduce((sum, renda) => sum + renda.valor, 0);
  const gastosPlanejados = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Calcular gastos realizados do mês selecionado
  const gastosRealizados = transactions
    .filter(t => t.type === 'despesa' && t.month === selectedMonth && t.year === selectedYear)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const saldoPrevisto = rendaTotal - gastosPlanejados;
  const saldoRealizado = rendaTotal - gastosRealizados;

  const handleAddRenda = () => {
    const novaRenda: RendaSource = {
      id: Date.now().toString(),
      nome: 'Nova Fonte',
      valor: 0
    };
    setRendas(prev => [...prev, novaRenda]);
  };

  const handleUpdateRenda = (id: string, campo: keyof RendaSource, valor: string | number) => {
    setRendas(prev => prev.map(renda => 
      renda.id === id ? { ...renda, [campo]: valor } : renda
    ));
  };

  const handleAddBudgetLine = () => {
    addBudgetItem({
      categoryId: '',
      subcategoryId: '',
      amount: 0,
      month: selectedMonth,
      year: selectedYear
    });
  };

  const handleUpdateBudgetLine = (itemId: string, field: string, value: any) => {
    updateBudgetItem(itemId, { [field]: value });
  };

  const handleDeleteBudgetLine = (itemId: string) => {
    deleteBudgetItem(itemId);
  };

  // Filtrar itens de orçamento para o mês/ano selecionado
  const currentBudgetItems = budgetItems.filter(item => 
    item.month === selectedMonth && item.year === selectedYear
  );

  // Preparar dados para o gráfico comparativo
  const chartData = currentBudgetItems.map(item => {
    const category = categories.find(c => c.id === item.categoryId);
    const subcategory = category?.subcategories.find(s => s.id === item.subcategoryId);
    
    // Calcular gasto realizado para esta categoria/subcategoria
    const realizado = transactions
      .filter(t => 
        t.type === 'despesa' && 
        t.month === selectedMonth && 
        t.year === selectedYear &&
        t.category === category?.name &&
        (subcategory ? t.subcategory === subcategory.name : true)
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      categoria: subcategory ? `${category?.name} - ${subcategory.name}` : category?.name || 'Sem categoria',
      planejado: item.amount,
      realizado,
      diferenca: realizado - item.amount
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 border rounded-lg shadow-md">
          <p className="font-semibold">{label}</p>
          <p className="text-primary">Planejado: {formatCurrency(data.planejado)}</p>
          <p className="text-secondary">Realizado: {formatCurrency(data.realizado)}</p>
          <p className={`font-medium ${data.diferenca >= 0 ? 'text-danger' : 'text-success'}`}>
            {data.diferenca >= 0 ? 'Acima' : 'Abaixo'} do planejado: {formatCurrency(Math.abs(data.diferenca))}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Planejamento Mensal</h1>
        <div className="flex items-center gap-4">
          <Select value={`${selectedMonth}`} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={`${i + 1}`}>
                  {new Date(0, i).toLocaleDateString('pt-BR', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={`${selectedYear}`} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => (
                <SelectItem key={selectedYear + i - 2} value={`${selectedYear + i - 2}`}>
                  {selectedYear + i - 2}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs do Planejamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renda Prevista</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(rendaTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {rendas.length} fonte(s) de renda
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Planejados</CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(gastosPlanejados)}</div>
            <p className="text-xs text-muted-foreground">
              Meta para este mês
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${saldoPrevisto >= 0 ? 'border-l-success' : 'border-l-danger'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Previsto</CardTitle>
            {saldoPrevisto >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-danger" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoPrevisto >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(saldoPrevisto)}
            </div>
            <p className="text-xs text-muted-foreground">
              {saldoPrevisto >= 0 ? 'Para dívidas/investimentos' : 'Planejamento excede renda'}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${saldoRealizado >= 0 ? 'border-l-success' : 'border-l-danger'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Realizado</CardTitle>
            {saldoRealizado >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-danger" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoRealizado >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(saldoRealizado)}
            </div>
            <p className="text-xs text-muted-foreground">
              Resultado atual do mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fontes de Renda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Fontes de Renda</span>
              <Button size="sm" onClick={handleAddRenda}>
                <DollarSign className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rendas.map((renda) => (
              <div key={renda.id} className="grid grid-cols-3 gap-2 items-center">
                <Input
                  value={renda.nome}
                  onChange={(e) => handleUpdateRenda(renda.id, 'nome', e.target.value)}
                  placeholder="Nome da renda"
                />
                <Input
                  type="number"
                  value={renda.valor}
                  onChange={(e) => handleUpdateRenda(renda.id, 'valor', parseFloat(e.target.value) || 0)}
                  placeholder="Valor"
                />
                <select
                  value={renda.restricao || ''}
                  onChange={(e) => handleUpdateRenda(renda.id, 'restricao', e.target.value || undefined)}
                  className="px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="">Sem restrição</option>
                  <option value="alimentacao">Vale Alimentação</option>
                  <option value="transporte">Vale Transporte</option>
                </select>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Planejamento Granular */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Orçamento Detalhado</span>
              <Button size="sm" onClick={handleAddBudgetLine}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Linha
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentBudgetItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum item de orçamento definido para este mês.</p>
                <p className="text-sm">Adicione linhas de orçamento para planejar seus gastos.</p>
              </div>
            ) : (
              currentBudgetItems.map((item) => {
                const category = categories.find(c => c.id === item.categoryId);
                const subcategory = category?.subcategories.find(s => s.id === item.subcategoryId);
                
                // Calcular gasto realizado
                const realizado = transactions
                  .filter(t => 
                    t.type === 'despesa' && 
                    t.month === selectedMonth && 
                    t.year === selectedYear &&
                    t.category === category?.name &&
                    (subcategory ? t.subcategory === subcategory.name : true)
                  )
                  .reduce((sum, t) => sum + t.amount, 0);

                const percentualGasto = item.amount > 0 ? (realizado / item.amount) * 100 : 0;
                
                return (
                  <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Select 
                        value={item.categoryId} 
                        onValueChange={(value) => handleUpdateBudgetLine(item.id, 'categoryId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(c => c.type === 'despesa').map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select 
                        value={item.subcategoryId || ''} 
                        onValueChange={(value) => handleUpdateBudgetLine(item.id, 'subcategoryId', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhuma</SelectItem>
                          {category?.subcategories.map(subcategory => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        placeholder="Valor orçado"
                        value={item.amount}
                        onChange={(e) => handleUpdateBudgetLine(item.id, 'amount', parseFloat(e.target.value) || 0)}
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudgetLine(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {item.amount > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {subcategory ? `${category?.name} - ${subcategory.name}` : category?.name}
                          </span>
                          <span className="text-muted-foreground">
                            {formatCurrency(realizado)} / {formatCurrency(item.amount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress 
                              value={Math.min(percentualGasto, 100)} 
                              className={`h-2 ${percentualGasto > 100 ? 'bg-danger/20' : ''}`}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            percentualGasto > 100 ? 'text-danger' : 
                            percentualGasto > 80 ? 'text-warning' : 'text-success'
                          }`}>
                            {percentualGasto.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Comparativo */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Planejado vs. Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="categoria" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="planejado" fill="hsl(var(--primary))" name="Planejado" />
                  <Bar dataKey="realizado" name="Realizado">
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.diferenca > 0 ? 'hsl(var(--danger))' : 'hsl(var(--success))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo e Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Planejamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-2">
                {formatCurrency(rendaTotal)}
              </div>
              <p className="text-sm text-muted-foreground">Renda Total Prevista</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-2">
                {formatCurrency(gastosPlanejados)}
              </div>
              <p className="text-sm text-muted-foreground">Gastos Planejados</p>
              <div className="text-xs text-muted-foreground mt-1">
                {((gastosPlanejados / rendaTotal) * 100).toFixed(1)}% da renda
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${saldoPrevisto >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(saldoPrevisto)}
              </div>
              <p className="text-sm text-muted-foreground">
                {saldoPrevisto >= 0 ? 'Disponível para Investir' : 'Ajuste Necessário'}
              </p>
            </div>
          </div>
          
          {saldoPrevisto < 0 && (
            <div className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-lg">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Atenção: Planejamento excede a renda!</span>
              </div>
              <p className="text-sm text-danger/80 mt-2">
                Você precisa reduzir os gastos planejados em {formatCurrency(Math.abs(saldoPrevisto))} 
                ou aumentar sua renda para equilibrar o orçamento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Planejamento;