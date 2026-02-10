import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'business';
  balance: number;
  currency: string;
  lastSync?: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  purpose: string;
  receiverVban?: string;
  type: 'incoming' | 'outgoing';
}

interface BankStore {
  accounts: BankAccount[];
  transactions: BankTransaction[];
  
  addAccount: (account: Omit<BankAccount, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteAccount: (id: string) => void;
  
  addTransaction: (transaction: Omit<BankTransaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<BankTransaction>) => void;
  deleteTransaction: (id: string) => void;
  
  replaceState: (newState: Partial<BankStore>) => void;
}

const generateId = () => `bank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useBankStore = create<BankStore>()(
  (set) => ({
    accounts: [],
    transactions: [],
    
    addAccount: (account) => {
      const newAccount: BankAccount = {
        ...account,
        id: generateId()
      };
      set((state) => ({
        accounts: [...state.accounts, newAccount]
      }));
    },
    
    updateAccount: (id, updates) => {
      set((state) => ({
        accounts: state.accounts.map(acc =>
          acc.id === id ? { ...acc, ...updates } : acc
        )
      }));
    },
    
    deleteAccount: (id) => {
      set((state) => ({
        accounts: state.accounts.filter(acc => acc.id !== id),
        transactions: state.transactions.filter(t => t.accountId !== id)
      }));
    },
    
    addTransaction: (transaction) => {
      const newTransaction: BankTransaction = {
        ...transaction,
        id: generateId()
      };
      set((state) => ({
        transactions: [...state.transactions, newTransaction]
      }));
    },
    
    updateTransaction: (id, updates) => {
      set((state) => ({
        transactions: state.transactions.map(t =>
          t.id === id ? { ...t, ...updates } : t
        )
      }));
    },
    
    deleteTransaction: (id) => {
      set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      }));
    },
    
    replaceState: (newState) => {
      set((state) => ({ ...state, ...newState }));
    }
  })
);