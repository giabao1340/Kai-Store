import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Cart } from "@/types";
import api from "@/services/api";
interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (dto: { variantId: string; quantity: number }) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
}

const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await api.get<Cart>("/cart");
      set({ cart });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (dto) => {
    // POST rồi fetch lại cart mới nhất
    const cart = await api.post<Cart>("/cart/items", dto);
    set({ cart }); // ← backend trả về cart mới → set thẳng vào store
  },

  getCartCount: async () => {
    await api.get;
  },

  updateItem: async (itemId, quantity) => {
    await api.patch(`/cart/items/${itemId}`, { quantity });
    const cart = await api.get<Cart>("/cart");
    set({ cart });
  },

  removeItem: async (itemId) => {
    await api.delete(`/cart/items/${itemId}`);
    const cart = await api.get<Cart>("/cart");
    set({ cart });
  },
  clearCart: () => set({ cart: null }),
}));

export default useCartStore;
