import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Material {
  id: string;
  name: string;
  ekPrice: number;
  unit: string;
  category?: 'raw' | 'engine' | 'other'; // Added category
}

export interface MaterialUsage {
  materialId: string;
  quantity: number;
}

export interface EndProduct {
  id: string;
  name: string;
  materials: MaterialUsage[];
  productionTime: number; // in minutes
  productionCost: number; // labor cost per hour
  markup: number;
  markupType: 'percent' | 'absolute';
  vkPrice?: number; // optional: manually set selling price
  category?: 'part' | 'vehicle'; // Added category
}

interface CalculatorStore {
  materials: Material[];
  endProducts: EndProduct[];
  
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  
  addEndProduct: (product: Omit<EndProduct, 'id'>) => void;
  updateEndProduct: (id: string, updates: Partial<EndProduct>) => void;
  deleteEndProduct: (id: string) => void;
  
  clearAllMaterials: () => void;
  clearAllProducts: () => void;
  
  replaceState: (newState: Partial<CalculatorStore>) => void;
}

const generateId = () => `calc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useCalculatorStore = create<CalculatorStore>()(
  (set) => ({
    materials: [],
    endProducts: [],
    
    addMaterial: (material) => {
      const newMaterial: Material = {
        ...material,
        id: generateId()
      };
      set((state) => ({
        materials: [...state.materials, newMaterial]
      }));
    },
    
    updateMaterial: (id, updates) => {
      set((state) => ({
        materials: state.materials.map(m =>
          m.id === id ? { ...m, ...updates } : m
        )
      }));
    },
    
    deleteMaterial: (id) => {
      set((state) => ({
        materials: state.materials.filter(m => m.id !== id)
      }));
    },
    
    addEndProduct: (product) => {
      const newProduct: EndProduct = {
        ...product,
        id: generateId()
      };
      set((state) => ({
        endProducts: [...state.endProducts, newProduct]
      }));
    },
    
    updateEndProduct: (id, updates) => {
      set((state) => ({
        endProducts: state.endProducts.map(p =>
          p.id === id ? { ...p, ...updates } : p
        )
      }));
    },
    
    deleteEndProduct: (id) => {
      set((state) => ({
        endProducts: state.endProducts.filter(p => p.id !== id)
      }));
    },
    
    clearAllMaterials: () => {
      set({ materials: [] });
    },
    
    clearAllProducts: () => {
      set({ endProducts: [] });
    },
    
    replaceState: (newState) => {
      set((state) => ({ ...state, ...newState }));
    }
  })
);