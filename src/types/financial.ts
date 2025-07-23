export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Account {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  subcategory?: string;
  account: string;
  month: number;
  year: number;
}

export interface BudgetItem {
  id: string;
  category: string;
  subcategory?: string;
  plannedAmount: number;
  month: number;
  year: number;
}

export interface PendingTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  suggestedCategory: string;
  suggestedSubcategory?: string;
  suggestedType: 'receita' | 'despesa';
}