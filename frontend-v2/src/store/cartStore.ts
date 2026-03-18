import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/types";

export interface CartItem {
  item: Partial<MenuItem>;
  quantity: number;
  notes: string;
}

interface CartState {
  items: CartItem[];
  tableNumber: string | null;
  setTableNumber: (table: string) => void;
  addItem: (item: Partial<MenuItem>) => void;
  removeItem: (itemId: string) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      setTableNumber: (tableNumber) => set({ tableNumber }),
      addItem: (item) => {
        const existing = get().items.find(c => c.item.id === item.id);
        if (existing) {
          set({ items: get().items.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c) });
        } else {
          set({ items: [...get().items, { item, quantity: 1, notes: "" }] });
        }
      },
      removeItem: (itemId) => {
        const existing = get().items.find(c => c.item.id === itemId);
        if (existing && existing.quantity > 1) {
          set({ items: get().items.map(c => c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c) });
        } else {
          set({ items: get().items.filter(c => c.item.id !== itemId) });
        }
      },
      updateNotes: (itemId, notes) =>
        set({ items: get().items.map(c => c.item.id === itemId ? { ...c, notes } : c) }),
      clearCart: () => set({ items: [], tableNumber: null }),
      totalItems: () => get().items.reduce((sum, c) => sum + c.quantity, 0),
      totalAmount: () => get().items.reduce((sum, c) => sum + (c.item.price || 0) * c.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);
