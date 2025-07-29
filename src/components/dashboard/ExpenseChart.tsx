import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { SubcategoryChart } from "./SubcategoryChart";

interface ExpenseChartProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: string;
  }>;
  subcategoryData?: Array<{
    subcategory: string;
    amount: number;
  }>;
  selectedCategory?: string;
  onCategoryClick: (category: string) => void;
  onBackToCategories?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Alimentação': 'hsl(var(--chart-1))',
  'Transporte': 'hsl(var(--chart-2))',
  'Lazer': 'hsl(var(--chart-3))',
  'Casa': 'hsl(270, 70%, 45%)', // Cor fixa roxa para Casa/Moradia
  'Saúde': 'hsl(var(--chart-5))',
  'Dívidas': 'hsl(0, 84%, 60%)', // Cor fixa vermelha para dívidas
  'Transferências': 'hsl(25, 80%, 55%)',
  'Vestuário': 'hsl(280, 65%, 55%)',
  'Educação': 'hsl(160, 70%, 45%)',
  'Outros': 'hsl(220, 70%, 50%)',
};

const DEFAULT_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(280, 65%, 55%)',
  'hsl(340, 75%, 60%)',
  'hsl(25, 80%, 55%)',
  'hsl(190, 75%, 50%)',
  'hsl(160, 70%, 45%)',
  'hsl(60, 80%, 50%)',
  'hsl(120, 60%, 45%)'
];

// Cores reservadas que não devem ser usadas por outras categorias
const RESERVED_COLORS = ['hsl(0, 84%, 60%)', 'hsl(270, 70%, 45%)']; // Vermelho para Dívidas e Roxo para Casa

// Generate consistent colors for categories, avoiding reserved colors
const getCategoryColor = (category: string, index: number) => {
  // Se a categoria tem cor fixa definida, usar sempre a mesma
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  
  // Para outras categorias, usar cores que não sejam reservadas
  let color = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  let colorIndex = index;
  
  // Evitar cores reservadas para outras categorias
  while (RESERVED_COLORS.includes(color) && colorIndex < DEFAULT_COLORS.length * 2) {
    colorIndex++;
    color = DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
  }
  
  return color;
};

// Generate colors for all categories consistently
const generateCategoryColors = (data: Array<{ category: string }>) => {
  return data.map((item, index) => getCategoryColor(item.category, index));
};

export const ExpenseChart = ({ data, subcategoryData, selectedCategory, onCategoryClick, onBackToCategories }: ExpenseChartProps) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  // Sort data in descending order for better visualization
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);
  const colors = generateCategoryColors(sortedData);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 border rounded-lg shadow-md">
          <p className="font-semibold">{data.category}</p>
          <p className="text-primary">{formatCurrency(data.amount)}</p>
          <p className="text-muted-foreground">{data.percentage}% do total</p>
        </div>
      );
    }
    return null;
  };

  const handlePieClick = (entry: any) => {
    onCategoryClick(entry.category);
  };

  const handleBarClick = (entry: any) => {
    onCategoryClick(entry.category);
  };

  // Show subcategory chart if data is available
  if (subcategoryData && selectedCategory && onBackToCategories) {
    return (
      <SubcategoryChart 
        data={subcategoryData}
        categoryName={selectedCategory}
        onBack={onBackToCategories}
      />
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Nenhuma despesa encontrada para o período selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        <Button
          variant={chartType === 'pie' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('pie')}
        >
          <PieChartIcon className="h-4 w-4 mr-2" />
          Pizza
        </Button>
        <Button
          variant={chartType === 'bar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('bar')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Barras
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={sortedData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="amount"
                    onClick={handlePieClick}
                    className="cursor-pointer"
                  >
                    {sortedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <BarChart data={sortedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="amount" 
                    onClick={handleBarClick}
                    className="cursor-pointer"
                    name="Valor Gasto"
                  >
                    {sortedData.map((entry, index) => (
                      <Cell 
                        key={`bar-cell-${index}`} 
                        fill={colors[index]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Categorias</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedData.map((item, index) => (
              <div 
                key={item.category}
                className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onCategoryClick(item.category)}
              >
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.amount)} ({item.percentage}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Clique em uma categoria para ver as transações detalhadas
      </div>
    </div>
  );
};