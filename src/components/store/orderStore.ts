import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  name: string;
  price: number;
  qty: number;
  disc: number;
}

export interface Order {
  id: string;
  number: string;
  ref: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  status: 'Ausstehend' | 'In Bearbeitung' | 'Warten auf Zahlung' | 'Gezahlt' | 'Abgeschlossen';
  taxRate: number;
  taxSign: 'plus' | 'minus';
  createdAt: string;
  completedAt?: string;
  paidAt?: string;
  finishedAt?: string;
  archived?: boolean;
  issued?: boolean;
  autoCloseTimer?: number;
}

interface OrderStore {
  customers: Customer[];
  items: Item[];
  ordersOpen: Order[];
  ordersDone: Order[];
  ordersArchive: Order[];
  orderPrefix: string;
  orderDigits: number;
  nextCounter: number;
  activeTimers: Map<string, number>;
  
  // Actions
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  
  createOrder: (order: Omit<Order, 'id' | 'number' | 'createdAt'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  moveOrderToCompleted: (id: string) => void;
  reopenOrder: (id: string) => void;
  archiveOrder: (id: string) => void;
  unarchiveOrder: (id: string) => void;
  moveToArchive: (id: string) => void;
  restoreFromArchive: (id: string) => void;
  deleteFromArchive: (id: string) => void;
  autoArchiveCompleted: () => void;
  
  // Automatic payment processing
  markOrderAsPaid: (orderId: string) => void;
  scheduleAutoClose: (orderId: string) => void;
  scheduleAutoArchive: (orderId: string) => void;
  cancelAutoClose: (orderId: string) => void;
  cancelAutoArchive: (orderId: string) => void;
  
  updateSettings: (settings: { prefix: string; digits: number; counter: number }) => void;
  replaceState: (newState: Partial<OrderStore>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useOrderStore = create<OrderStore>()(
  (set, get) => ({
    customers: [
      { id: 'def_c_1', name: 'CarFactoryGambinoCo', email: 'CarFactoryGambinoCo@statev.de', phone: '' },
      { id: 'def_c_2', name: 'hyped', email: 'hyped@statev.de', phone: '' },
      { id: 'def_c_3', name: 'Nexus Corp', email: 'Jannis_Cain@statev.de', phone: '' },
      { id: 'def_c_4', name: 'Andre_Johnson', email: 'Andre_Johnson@statev.de', phone: '' },
      { id: 'def_c_5', name: 'PDM Motors', email: 'Valea_Machiavelli@statev.de', phone: '' },
      { id: 'def_c_6', name: 'Hope-Production', email: 'Lucia_Lorenzi@statev.de', phone: '' },
      { id: 'def_c_7', name: 'Robert_Finster', email: 'Robert_Finster@statev.de', phone: '' },
    ],
    items: [
      { id: 'def_i_1', name: 'Pappe', price: 1.00 },
      { id: 'def_i_2', name: 'Tannenholz', price: 1.00 },
      { id: 'def_i_3', name: 'Sack Glasgranulat', price: 8.40 },
      { id: 'def_i_4', name: 'Eisenbarren', price: 17.00 },
      { id: 'def_i_5', name: 'Kupferbarren', price: 22.00 },
      { id: 'def_i_6', name: 'Silberbarren', price: 25.00 },
      { id: 'def_i_7', name: 'Stahlbarren', price: 56.00 },
      { id: 'def_i_8', name: 'Goldbarren', price: 65.00 },
    ],
    ordersOpen: [],
    ordersDone: [],
    ordersArchive: [],
    orderPrefix: 'SD',
    orderDigits: 4,
    nextCounter: 1145,
    activeTimers: new Map(),

    addCustomer: (customer) => {
      const newCustomer = { ...customer, id: generateId() };
      set((state) => ({ 
        customers: [newCustomer, ...state.customers] 
      }));
    },

    updateCustomer: (id, updates) => {
      set((state) => ({
        customers: state.customers.map(c => 
          c.id === id ? { ...c, ...updates } : c
        )
      }));
    },

    deleteCustomer: (id) => {
      set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      }));
    },

    addItem: (item) => {
      const newItem = { ...item, id: generateId() };
      set((state) => ({ 
        items: [newItem, ...state.items] 
      }));
    },

    updateItem: (id, updates) => {
      set((state) => ({
        items: state.items.map(i => 
          i.id === id ? { ...i, ...updates } : i
        )
      }));
    },

    deleteItem: (id) => {
      set((state) => ({
        items: state.items.filter(i => i.id !== id)
      }));
    },

    createOrder: (order) => {
      const state = get();
      const paddedCounter = state.nextCounter.toString().padStart(state.orderDigits, '0');
      const orderNumber = `${state.orderPrefix}${paddedCounter}`;
      
      const newOrder: Order = {
        ...order,
        id: generateId(),
        number: orderNumber,
        createdAt: new Date().toISOString()
      };

      set((state) => ({
        ordersOpen: [newOrder, ...state.ordersOpen],
        nextCounter: state.nextCounter + 1
      }));
    },

    updateOrder: (id, updates) => {
      set((state) => {
        const updateInArray = (orders: Order[]) => 
          orders.map(o => o.id === id ? { ...o, ...updates } : o);

        return {
          ordersOpen: updateInArray(state.ordersOpen),
          ordersDone: updateInArray(state.ordersDone),
          ordersArchive: updateInArray(state.ordersArchive)
        };
      });

      // Wenn auf "Abgeschlossen" gesetzt, Timer starten
      if (updates.status === 'Abgeschlossen') {
        get().scheduleAutoArchive(id);
      }
    },

    deleteOrder: (id) => {
      set((state) => ({
        ordersOpen: state.ordersOpen.filter(o => o.id !== id)
      }));
    },

    moveOrderToCompleted: (id) => {
      set((state) => {
        const order = state.ordersOpen.find(o => o.id === id);
        if (!order) return state;

        const updatedOrder = {
          ...order,
          status: 'Abgeschlossen' as const,
          completedAt: new Date().toISOString()
        };

        return {
          ordersOpen: state.ordersOpen.filter(o => o.id !== id),
          ordersDone: [updatedOrder, ...state.ordersDone]
        };
      });
    },

    reopenOrder: (id) => {
      set((state) => {
        const order = state.ordersDone.find(o => o.id === id);
        if (!order) return state;

        return {
          ordersOpen: [order, ...state.ordersOpen],
          ordersDone: state.ordersDone.filter(o => o.id !== id)
        };
      });
    },

    archiveOrder: (id) => {
      set((state) => {
        const order = state.ordersDone.find(o => o.id === id);
        if (!order) return state;

        const archivedOrder = {
          ...order,
          archived: true,
          finishedAt: new Date().toISOString()
        };

        return {
          ordersDone: state.ordersDone.filter(o => o.id !== id),
          ordersArchive: [archivedOrder, ...state.ordersArchive]
        };
      });
    },

    unarchiveOrder: (id) => {
      set((state) => {
        const order = state.ordersArchive.find(o => o.id === id);
        if (!order) return state;

        const { archived, finishedAt, ...restoredOrder } = order;

        return {
          ordersDone: [restoredOrder, ...state.ordersDone],
          ordersArchive: state.ordersArchive.filter(o => o.id !== id)
        };
      });
    },

    moveToArchive: (id) => {
      const state = get();
      let order = state.ordersDone.find(o => o.id === id);
      let fromOpen = false;
      
      if (!order) {
        order = state.ordersOpen.find(o => o.id === id);
        fromOpen = true;
      }
      
      if (!order) return;

      set((state) => {
        const archivedOrder = {
          ...order,
          archived: true,
          finishedAt: order.finishedAt || new Date().toISOString()
        };

        if (fromOpen) {
          return {
            ordersOpen: state.ordersOpen.filter(o => o.id !== id),
            ordersArchive: [archivedOrder, ...state.ordersArchive]
          };
        }

        return {
          ordersDone: state.ordersDone.filter(o => o.id !== id),
          ordersArchive: [archivedOrder, ...state.ordersArchive]
        };
      });
    },

    restoreFromArchive: (id) => {
      set((state) => {
        const order = state.ordersArchive.find(o => o.id === id);
        if (!order) return state;

        const { archived, finishedAt, ...restoredOrder } = order;

        return {
          ordersOpen: [restoredOrder, ...state.ordersOpen],
          ordersArchive: state.ordersArchive.filter(o => o.id !== id)
        };
      });
    },

    deleteFromArchive: (id) => {
      set((state) => ({
        ordersArchive: state.ordersArchive.filter(o => o.id !== id)
      }));
    },

    autoArchiveCompleted: () => {
      set((state) => {
        const completedOrdersDone = state.ordersDone.filter(o => o.status === 'Abgeschlossen');
        const remainingOrdersDone = state.ordersDone.filter(o => o.status !== 'Abgeschlossen');

        const completedOrdersOpen = state.ordersOpen.filter(o => o.status === 'Abgeschlossen');
        const remainingOrdersOpen = state.ordersOpen.filter(o => o.status !== 'Abgeschlossen');
        
        const allCompletedOrders = [...completedOrdersDone, ...completedOrdersOpen];
        
        const archivedOrders = allCompletedOrders.map(order => ({
          ...order,
          archived: true,
          finishedAt: order.finishedAt || new Date().toISOString()
        }));

        if (allCompletedOrders.length > 0) {
          // Toast removed
        }

        return {
          ordersOpen: remainingOrdersOpen,
          ordersDone: remainingOrdersDone,
          ordersArchive: [...archivedOrders, ...state.ordersArchive]
        };
      });
    },

    markOrderAsPaid: (orderId) => {
      const state = get();
      let order = state.ordersOpen.find(o => o.id === orderId);
      let fromOpen = true;
      
      if (!order) {
        order = state.ordersDone.find(o => o.id === orderId);
        fromOpen = false;
      }

      if (!order) return;

      const updatedOrder = {
        ...order,
        status: 'Gezahlt' as const,
        paidAt: new Date().toISOString()
      };

      if (fromOpen) {
        set((state) => ({
          ordersOpen: state.ordersOpen.filter(o => o.id !== orderId),
          ordersDone: [updatedOrder, ...state.ordersDone]
        }));
      } else {
        set((state) => ({
          ordersDone: state.ordersDone.map(o => 
            o.id === orderId ? updatedOrder : o
          )
        }));
      }

      setTimeout(() => {
        get().scheduleAutoClose(orderId);
      }, 100);

      // Toast removed
    },

    scheduleAutoClose: (orderId) => {
      const state = get();
      const order = state.ordersDone.find(o => o.id === orderId);
      
      if (!order || order.status !== 'Gezahlt') return;

      const isTestMode = localStorage.getItem('autoPaymentTestMode') === 'true';
      const closeTimerDuration = isTestMode ? 60000 : 1800000; 

      const closeTimerId = setTimeout(() => {
        const currentState = get();
        const currentOrder = currentState.ordersDone.find(o => o.id === orderId);
        
        if (currentOrder && currentOrder.status === 'Gezahlt') {
          set((state) => ({
            ordersDone: state.ordersDone.map(o => 
              o.id === orderId 
                ? { 
                    ...o, 
                    status: 'Abgeschlossen', 
                    finishedAt: new Date().toISOString() 
                  } 
                : o
            )
          }));

          setTimeout(() => {
            get().scheduleAutoArchive(orderId);
          }, 100);

          const newTimers = new Map(currentState.activeTimers instanceof Map ? currentState.activeTimers : []);
          newTimers.delete(orderId);
          set({ activeTimers: newTimers });

          // Toast removed
        }
      }, closeTimerDuration);

      const newTimers = new Map(state.activeTimers instanceof Map ? state.activeTimers : []);
      newTimers.set(orderId, closeTimerId);
      set({ activeTimers: newTimers });
    },

    scheduleAutoArchive: (orderId) => {
      const state = get();
      const order = state.ordersDone.find(o => o.id === orderId);
      
      if (!order || order.status !== 'Abgeschlossen') return;

      const isTestMode = localStorage.getItem('autoPaymentTestMode') === 'true';
      const archiveTimerDuration = isTestMode ? 60000 : 1800000; // 30 Minuten 

      const archiveTimerId = setTimeout(() => {
        const currentState = get();
        const currentOrder = currentState.ordersDone.find(o => o.id === orderId);
        
        if (currentOrder && currentOrder.status === 'Abgeschlossen') {
          const archivedOrder = {
            ...currentOrder,
            archived: true,
            finishedAt: currentOrder.finishedAt || new Date().toISOString()
          };

          set((state) => {
            if (state.ordersDone.find(o => o.id === orderId)) {
              return {
                ordersDone: state.ordersDone.filter(o => o.id !== orderId),
                ordersArchive: [archivedOrder, ...state.ordersArchive]
              };
            }
            return state;
          });

          const newTimers = new Map(state.activeTimers instanceof Map ? state.activeTimers : []);
          newTimers.delete(`archive-${orderId}`);
          set({ activeTimers: newTimers });

          // Toast removed
        }
      }, archiveTimerDuration);

      const newTimers = new Map(state.activeTimers instanceof Map ? state.activeTimers : []);
      newTimers.set(`archive-${orderId}`, archiveTimerId);
      set({ activeTimers: newTimers });
    },

    cancelAutoClose: (orderId) => {
      const state = get();
      const timers = state.activeTimers instanceof Map ? state.activeTimers : new Map();
      if (timers.has(orderId)) {
        clearTimeout(timers.get(orderId));
        const newTimers = new Map(timers);
        newTimers.delete(orderId);
        set({ activeTimers: newTimers });
      }
    },

    cancelAutoArchive: (orderId) => {
      const state = get();
      const timers = state.activeTimers instanceof Map ? state.activeTimers : new Map();
      const archiveKey = `archive-${orderId}`;
      if (timers.has(archiveKey)) {
        clearTimeout(timers.get(archiveKey));
        const newTimers = new Map(timers);
        newTimers.delete(archiveKey);
        set({ activeTimers: newTimers });
      }
    },

    updateSettings: (settings) => {
      set({
        orderPrefix: settings.prefix,
        orderDigits: settings.digits,
        nextCounter: settings.counter
      });
    },

    replaceState: (newState) => {
      set((state) => {
        // Filter out properties that shouldn't be replaced or need special handling
        const filteredUpdate = { ...newState };
        
        // activeTimers should never be synced/overwritten from remote as they are local timeouts
        if ('activeTimers' in filteredUpdate) {
          delete filteredUpdate.activeTimers;
        }

        return { ...state, ...filteredUpdate };
      });
    }
  })
);