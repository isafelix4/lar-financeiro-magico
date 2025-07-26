import { useState, useEffect } from 'react';
import type { Category, Subcategory, Account, Transaction, BudgetItem } from '@/types/financial';

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'alimentacao',
    name: 'Alimentação',
    type: 'despesa',
    subcategories: [
      { id: 'supermercado', name: 'Supermercado', categoryId: 'alimentacao' },
      { id: 'restaurantes', name: 'Restaurantes', categoryId: 'alimentacao' },
      { id: 'delivery', name: 'Delivery', categoryId: 'alimentacao' }
    ]
  },
  {
    id: 'transporte',
    name: 'Transporte',
    type: 'despesa',
    subcategories: [
      { id: 'combustivel', name: 'Combustível', categoryId: 'transporte' },
      { id: 'transporte-publico', name: 'Transporte Público', categoryId: 'transporte' },
      { id: 'aplicativo', name: 'Aplicativo de Transporte', categoryId: 'transporte' }
    ]
  },
  {
    id: 'lazer',
    name: 'Lazer',
    type: 'despesa',
    subcategories: [
      { id: 'streaming', name: 'Streaming', categoryId: 'lazer' },
      { id: 'cinema', name: 'Cinema', categoryId: 'lazer' },
      { id: 'restaurantes-lazer', name: 'Restaurantes', categoryId: 'lazer' }
    ]
  },
  {
    id: 'casa',
    name: 'Casa',
    type: 'despesa',
    subcategories: [
      { id: 'aluguel', name: 'Aluguel', categoryId: 'casa' },
      { id: 'condominio', name: 'Condomínio', categoryId: 'casa' },
      { id: 'energia', name: 'Energia Elétrica', categoryId: 'casa' },
      { id: 'agua', name: 'Água', categoryId: 'casa' },
      { id: 'internet', name: 'Internet', categoryId: 'casa' }
    ]
  },
  {
    id: 'saude',
    name: 'Saúde',
    type: 'despesa',
    subcategories: [
      { id: 'farmacia', name: 'Farmácia', categoryId: 'saude' },
      { id: 'medico', name: 'Consultas Médicas', categoryId: 'saude' },
      { id: 'plano-saude', name: 'Plano de Saúde', categoryId: 'saude' }
    ]
  },
  {
    id: 'dividas',
    name: 'Dívidas',
    type: 'despesa',
    subcategories: [
      { id: 'cartao', name: 'Cartão de Crédito', categoryId: 'dividas' },
      { id: 'financiamento', name: 'Financiamento', categoryId: 'dividas' },
      { id: 'emprestimo', name: 'Empréstimo', categoryId: 'dividas' }
    ]
  },
  {
    id: 'vestuario',
    name: 'Vestuário',
    type: 'despesa',
    subcategories: [
      { id: 'roupas', name: 'Roupas', categoryId: 'vestuario' },
      { id: 'calcados', name: 'Calçados', categoryId: 'vestuario' }
    ]
  },
  {
    id: 'educacao',
    name: 'Educação',
    type: 'despesa',
    subcategories: [
      { id: 'cursos', name: 'Cursos', categoryId: 'educacao' },
      { id: 'livros', name: 'Livros', categoryId: 'educacao' },
      { id: 'material', name: 'Material Escolar', categoryId: 'educacao' }
    ]
  },
  {
    id: 'outros-despesa',
    name: 'Outros',
    type: 'despesa',
    subcategories: []
  },
  {
    id: 'salario',
    name: 'Salário',
    type: 'receita',
    subcategories: [
      { id: 'salario-principal', name: 'Salário Principal', categoryId: 'salario' },
      { id: 'bonus', name: 'Bônus', categoryId: 'salario' },
      { id: 'decimo-terceiro', name: '13º Salário', categoryId: 'salario' }
    ]
  },
  {
    id: 'freelance',
    name: 'Freelance',
    type: 'receita',
    subcategories: []
  },
  {
    id: 'investimentos',
    name: 'Investimentos',
    type: 'receita',
    subcategories: [
      { id: 'dividendos', name: 'Dividendos', categoryId: 'investimentos' },
      { id: 'juros', name: 'Juros', categoryId: 'investimentos' }
    ]
  },
  {
    id: 'outros-receita',
    name: 'Outros',
    type: 'receita',
    subcategories: []
  }
];

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'conta-principal', name: 'Conta Principal' }
];

export const useFinancialData = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem('financial-categories');
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const stored = localStorage.getItem('financial-accounts');
    return stored ? JSON.parse(stored) : DEFAULT_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem('financial-transactions');
    return stored ? JSON.parse(stored) : [];
  });

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    const stored = localStorage.getItem('financial-budget');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('financial-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('financial-accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('financial-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('financial-budget', JSON.stringify(budgetItems));
  }, [budgetItems]);

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: `category-${Date.now()}`,
      subcategories: category.subcategories.map(sub => ({
        ...sub,
        id: `subcategory-${Date.now()}-${Math.random()}`,
        categoryId: `category-${Date.now()}`
      }))
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const addSubcategory = (categoryId: string, subcategory: Omit<Subcategory, 'id' | 'categoryId'>) => {
    const newSubcategory: Subcategory = {
      ...subcategory,
      id: `subcategory-${Date.now()}`,
      categoryId
    };
    
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
        : cat
    ));
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId) }
        : cat
    ));
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    // Verificar se já existe uma conta com esse nome
    const existingAccount = accounts.find(acc => acc.name.toLowerCase() === account.name.toLowerCase());
    if (existingAccount) {
      return existingAccount;
    }

    const newAccount: Account = {
      ...account,
      id: `account-${Date.now()}`
    };
    setAccounts(prev => [...prev, newAccount]);
    return newAccount;
  };

  const addTransactions = (newTransactions: Transaction[]) => {
    setTransactions(prev => [...prev, ...newTransactions]);
  };

  const updateTransaction = (transactionId: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === transactionId ? { ...transaction, ...updates } : transaction
    ));
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
  };

  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      ...item,
      id: `budget-${Date.now()}`
    };
    setBudgetItems(prev => [...prev, newItem]);
  };

  const updateBudgetItem = (itemId: string, updates: Partial<BudgetItem>) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const deleteBudgetItem = (itemId: string) => {
    setBudgetItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Função para processar pagamento de dívida
  const processarPagamentoDivida = (dividaId: string, valorPagamento: number) => {
    // Esta função será implementada quando integrarmos com a página de dívidas
    // Por enquanto, armazenamos a informação para futura integração
    const pagamentoInfo = {
      dividaId,
      valorPagamento,
      data: new Date().toISOString()
    };
    
    // Armazenar no localStorage para que a página de dívidas possa processar
    const pagamentos = JSON.parse(localStorage.getItem('debt-payments') || '[]');
    pagamentos.push(pagamentoInfo);
    localStorage.setItem('debt-payments', JSON.stringify(pagamentos));
    
    // Disparar evento customizado para notificar outras partes da aplicação
    window.dispatchEvent(new CustomEvent('debt-payment', { detail: pagamentoInfo }));
  };

  return {
    categories,
    accounts,
    transactions,
    budgetItems,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    addAccount,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    processarPagamentoDivida
  };
};