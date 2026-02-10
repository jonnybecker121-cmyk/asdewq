import { create } from 'zustand';

export interface TransportItem {
  name: string;
  quantity: number;
}

export interface TransportOrder {
  id: string;
  itemName: string; // Legacy field for compatibility
  quantity: number; // Legacy field for compatibility
  items: TransportItem[]; // New: support for multiple items
  price: number; // New field for total order price
  fromTime: string;
  toTime: string;
  status: 'pending' | 'arrived';
  createdAt: string;
  arrivedAt?: string;
}

interface TransportOrderStore {
  orders: TransportOrder[];
  addOrder: (order: Omit<TransportOrder, 'id' | 'status' | 'createdAt'>) => void;
  markAsArrived: (id: string) => void;
  deleteOrder: (id: string) => void;
  replaceState: (newState: Partial<TransportOrderStore>) => void;
}

export const useTransportOrderStore = create<TransportOrderStore>((set) => ({
  orders: [],
  addOrder: (order) => {
    const newOrder: TransportOrder = {
      ...order,
      id: `to-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ orders: [newOrder, ...state.orders] }));
  },
  markAsArrived: (id: string) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id
          ? { ...order, status: 'arrived', arrivedAt: new Date().toISOString() }
          : order
      ),
    }));
  },
  deleteOrder: (id: string) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    }));
  },
  replaceState: (newState) => {
    set((state) => ({ ...state, ...newState }));
  },
}));