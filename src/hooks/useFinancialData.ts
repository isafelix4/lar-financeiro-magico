import { useState, useEffect } from 'react';
import type { Category, Subcategory, Account, Transaction, BudgetItem, Debt } from '@/types/financial';

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

  const [debts, setDebts] = useState<Debt[]>(() => {
    const stored = localStorage.getItem('financial-dividas');
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

  useEffect(() => {
    localStorage.setItem('financial-dividas', JSON.stringify(debts));
  }, [debts]);

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

  // Função para processar pagamento de dívida com automação completa
  const processarPagamentoDivida = (dividaId: string, valorPagamento: number) => {
    const currentDate = new Date();
    
    setDebts(prev => prev.map(debt => {
      if (debt.id === dividaId && debt.parcelasRestantes > 0) {
        return {
          ...debt,
          saldoDevedor: Math.max(0, debt.saldoDevedor - valorPagamento),
          parcelasRestantes: Math.max(0, debt.parcelasRestantes - 1),
          status: 'Em dia',
          ultimoPagamento: currentDate.toISOString()
        };
      }
      return debt;
    }));
    
    // Notificar outras partes da aplicação
    window.dispatchEvent(new CustomEvent('debt-payment', { 
      detail: { dividaId, valorPagamento, data: currentDate.toISOString() }
    }));
  };

  // Função para aplicar capitalização de juros e atualizar status
  const aplicarCapitalizacaoEAtualizarStatus = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    setDebts(prev => prev.map(debt => {
      const debtStartDate = new Date(debt.dataInicio);
      const hasPaymentThisMonth = transactions.some(t => 
        t.category === 'Dívidas' && 
        t.month === currentMonth && 
        t.year === currentYear &&
        // Here we would need a way to link transactions to debts
        // For now, we'll check if there are any debt payments this month
        true
      );
      
      // Update status based on payment history
      let newStatus = debt.status;
      if (hasPaymentThisMonth) {
        newStatus = 'Em dia';
      } else if (debt.status !== 'Suspensa') {
        // Check if no payments in last 2 months (simplified logic)
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        
        if (debt.ultimoPagamento) {
          const lastPaymentDate = new Date(debt.ultimoPagamento);
          if (lastPaymentDate < twoMonthsAgo) {
            newStatus = 'Em atraso';
          }
        } else if (debtStartDate < twoMonthsAgo) {
          newStatus = 'Em atraso';
        }
      }
      
      // Apply interest capitalization if no payment and debt is active
      let newSaldoDevedor = debt.saldoDevedor;
      if (!hasPaymentThisMonth && currentDate > debtStartDate && debt.parcelasRestantes > 0) {
        newSaldoDevedor = debt.saldoDevedor * (1 + (debt.taxaJuros / 100));
      }
      
      return {
        ...debt,
        saldoDevedor: newSaldoDevedor,
        status: newStatus
      };
    }));
  };

  // Run monthly debt updates
  useEffect(() => {
    aplicarCapitalizacaoEAtualizarStatus();
  }, [transactions]); // Run when transactions change

  return {
    categories,
    accounts,
    transactions,
    budgetItems,
    debts,
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
    processarPagamentoDivida,
    aplicarCapitalizacaoEAtualizarStatus
  };
};