import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PaymentNote {
  id: string;
  title: string;
  content: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceStoreState {
  paymentNotes: PaymentNote[];
  addPaymentNote: (title: string, content: string, isDefault?: boolean) => void;
  updatePaymentNote: (id: string, title: string, content: string) => void;
  deletePaymentNote: (id: string) => void;
  setDefaultPaymentNote: (id: string) => void;
  getDefaultPaymentNote: () => PaymentNote | undefined;
  replaceState: (newState: Partial<InvoiceStoreState>) => void; 
}

export const useInvoiceStore = create<InvoiceStoreState>()(
  (set, get) => ({
    paymentNotes: [
      {
        id: 'default-1',
        title: 'Standard Zahlungshinweis',
        content: 'Bitte überweisen Sie den Betrag bis zum Fälligkeitsdatum.',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-2',
        title: 'Sofortüberweisung',
        content: 'Der Betrag ist sofort nach Rechnungsstellung fällig. Vielen Dank für Ihr Verständnis.',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-3',
        title: '30 Tage Zahlungsziel',
        content: 'Zahlungsziel: 30 Tage netto. Bei Zahlungsverzug behalten wir uns vor, Verzugszinsen zu berechnen.',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    
    addPaymentNote: (title: string, content: string, isDefault = false) => {
      const newNote: PaymentNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        content,
        isDefault,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      set((state) => ({
        paymentNotes: isDefault 
          ? [
              ...state.paymentNotes.map(note => ({ ...note, isDefault: false })),
              newNote
            ]
          : [...state.paymentNotes, newNote]
      }));
    },
    
    updatePaymentNote: (id: string, title: string, content: string) => {
      set((state) => ({
        paymentNotes: state.paymentNotes.map(note =>
          note.id === id
            ? { ...note, title, content, updatedAt: new Date() }
            : note
        )
      }));
    },
    
    deletePaymentNote: (id: string) => {
      set((state) => ({
        paymentNotes: state.paymentNotes.filter(note => note.id !== id)
      }));
    },
    
    setDefaultPaymentNote: (id: string) => {
      set((state) => ({
        paymentNotes: state.paymentNotes.map(note => ({
          ...note,
          isDefault: note.id === id
        }))
      }));
    },
    
    getDefaultPaymentNote: () => {
      const state = get();
      return state.paymentNotes.find(note => note.isDefault);
    },

    replaceState: (newState) => {
      set((state) => ({
        ...state,
        ...newState
      }));
    }
  })
);