import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  vCardUrl?: string;
}

interface EmployeeStore {
  employees: Employee[];
  
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  replaceState: (newState: Partial<EmployeeStore>) => void;
}

const generateId = () => `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useEmployeeStore = create<EmployeeStore>()(
  (set) => ({
    employees: [],
    
    addEmployee: (employee) => {
      const newEmployee: Employee = {
        ...employee,
        id: generateId()
      };
      set((state) => ({
        employees: [...state.employees, newEmployee]
      }));
    },
    
    updateEmployee: (id, updates) => {
      set((state) => ({
        employees: state.employees.map(emp =>
          emp.id === id ? { ...emp, ...updates } : emp
        )
      }));
    },
    
    deleteEmployee: (id) => {
      set((state) => ({
        employees: state.employees.filter(emp => emp.id !== id)
      }));
    },
    
    replaceState: (newState) => {
      set((state) => ({ ...state, ...newState }));
    }
  })
);