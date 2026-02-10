import { create } from 'zustand';

export interface Contract {
  id: string;
  contractNumber: string;
  partnerName: string;
  partnerAddress: string;
  type: 'Arbeitsvertrag' | 'Pachtvertrag' | 'Darlehensvertrag' | 'Kooperationsvertrag' | 'Individuell';
  title: string;
  content: string;
  value: number;
  netValue?: number; // Added net value for specific contract types like Arbeitsvertrag
  date: string;
  endDate?: string; // Feature: Contract expiration
  isRecurring: boolean; // Feature: Recurring payments
  recurringInterval?: 'monthly' | 'weekly' | 'yearly';
  status: 'draft' | 'signed' | 'archived' | 'expired';
  createdAt: string;
}

interface ContractStore {
  contracts: Contract[];
  addContract: (contract: Omit<Contract, 'id' | 'createdAt' | 'status'>) => void;
  updateContractStatus: (id: string, status: Contract['status']) => void;
  deleteContract: (id: string) => void;
  replaceState: (newState: Partial<ContractStore>) => void;
}

export const useContractStore = create<ContractStore>((set) => ({
  contracts: [],
  addContract: (contract) => {
    const newContract: Contract = {
      ...contract,
      id: `ctr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ contracts: [newContract, ...state.contracts] }));
  },
  updateContractStatus: (id, status) => {
    set((state) => ({
      contracts: state.contracts.map((c) =>
        c.id === id ? { ...c, status } : c
      ),
    }));
  },
  deleteContract: (id) => {
    set((state) => ({
      contracts: state.contracts.filter((c) => c.id !== id),
    }));
  },
  replaceState: (newState) => {
    set((state) => ({ ...state, ...newState }));
  },
}));