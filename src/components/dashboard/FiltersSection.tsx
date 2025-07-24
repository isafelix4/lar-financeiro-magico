import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import type { Transaction } from "@/pages/VisaoGeral";

interface FiltersSectionProps {
  selectedMonth: number[];
  selectedYear: number[];
  selectedAccount: string[];
  selectedCategory: string[];
  selectedSubcategory: string[];
  transactions: Transaction[];
  onMonthChange: (months: number[]) => void;
  onYearChange: (years: number[]) => void;
  onAccountChange: (accounts: string[]) => void;
  onCategoryChange: (categories: string[]) => void;
  onSubcategoryChange: (subcategories: string[]) => void;
}

const months = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" }
];

export const FiltersSection = ({
  selectedMonth,
  selectedYear,
  selectedAccount,
  selectedCategory,
  selectedSubcategory,
  transactions,
  onMonthChange,
  onYearChange,
  onAccountChange,
  onCategoryChange,
  onSubcategoryChange
}: FiltersSectionProps) => {
  // Extrair anos únicos das transações
  const availableYears = Array.from(
    new Set(transactions.map(t => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a);

  // Extrair contas únicas das transações
  const availableAccounts = Array.from(
    new Set(transactions.map(t => t.account))
  ).filter(Boolean);

  // Extrair categorias únicas das transações
  const availableCategories = Array.from(
    new Set(transactions.map(t => t.category))
  ).filter(Boolean);

  // Extrair subcategorias únicas das transações
  const availableSubcategories = Array.from(
    new Set(transactions.map(t => t.subcategory).filter(Boolean))
  ).filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mês</label>
            <Select 
              value={selectedMonth.length === 1 ? selectedMonth[0].toString() : "multiplos"} 
              onValueChange={(value) => {
                if (value === "multiplos") return;
                const monthValue = parseInt(value);
                const newMonths = selectedMonth.includes(monthValue) 
                  ? selectedMonth.filter(m => m !== monthValue)
                  : [...selectedMonth, monthValue];
                onMonthChange(newMonths);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  selectedMonth.length === 0 ? "Selecione meses" :
                  selectedMonth.length === 1 ? months.find(m => m.value === selectedMonth[0])?.label :
                  `${selectedMonth.length} meses selecionados`
                } />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {selectedMonth.includes(month.value) ? "✓ " : ""}{month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ano</label>
            <Select 
              value={selectedYear.length === 1 ? selectedYear[0].toString() : "multiplos"} 
              onValueChange={(value) => {
                if (value === "multiplos") return;
                const yearValue = parseInt(value);
                const newYears = selectedYear.includes(yearValue) 
                  ? selectedYear.filter(y => y !== yearValue)
                  : [...selectedYear, yearValue];
                onYearChange(newYears);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  selectedYear.length === 0 ? "Selecione anos" :
                  selectedYear.length === 1 ? selectedYear[0].toString() :
                  `${selectedYear.length} anos selecionados`
                } />
              </SelectTrigger>
              <SelectContent>
                {availableYears.length > 0 ? (
                  availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {selectedYear.includes(year) ? "✓ " : ""}{year}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={new Date().getFullYear().toString()}>
                    {new Date().getFullYear()}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Conta Bancária</label>
            <Select 
              value={selectedAccount.length === 1 ? selectedAccount[0] : "multiplas"} 
              onValueChange={(value) => {
                if (value === "multiplas") return;
                const newAccounts = selectedAccount.includes(value) 
                  ? selectedAccount.filter(a => a !== value)
                  : [...selectedAccount, value];
                onAccountChange(newAccounts);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  selectedAccount.length === 0 ? "Selecione contas" :
                  selectedAccount.length === 1 ? selectedAccount[0] :
                  `${selectedAccount.length} contas selecionadas`
                } />
              </SelectTrigger>
              <SelectContent>
                {availableAccounts.map((account) => (
                  <SelectItem key={account} value={account}>
                    {selectedAccount.includes(account) ? "✓ " : ""}{account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select 
              value={selectedCategory.length === 1 ? selectedCategory[0] : "multiplas"} 
              onValueChange={(value) => {
                if (value === "multiplas") return;
                const newCategories = selectedCategory.includes(value) 
                  ? selectedCategory.filter(c => c !== value)
                  : [...selectedCategory, value];
                onCategoryChange(newCategories);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  selectedCategory.length === 0 ? "Selecione categorias" :
                  selectedCategory.length === 1 ? selectedCategory[0] :
                  `${selectedCategory.length} categorias selecionadas`
                } />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {selectedCategory.includes(category) ? "✓ " : ""}{category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subcategoria</label>
            <Select 
              value={selectedSubcategory.length === 1 ? selectedSubcategory[0] : "multiplas"} 
              onValueChange={(value) => {
                if (value === "multiplas") return;
                const newSubcategories = selectedSubcategory.includes(value) 
                  ? selectedSubcategory.filter(s => s !== value)
                  : [...selectedSubcategory, value];
                onSubcategoryChange(newSubcategories);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  selectedSubcategory.length === 0 ? "Selecione subcategorias" :
                  selectedSubcategory.length === 1 ? selectedSubcategory[0] :
                  `${selectedSubcategory.length} subcategorias selecionadas`
                } />
              </SelectTrigger>
              <SelectContent>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {selectedSubcategory.includes(subcategory) ? "✓ " : ""}{subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};