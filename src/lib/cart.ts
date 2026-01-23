import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedModel: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, selectedModel: string) => void;
  updateQuantity: (productId: string, selectedModel: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId && i.selectedModel === item.selectedModel
          );
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.selectedModel === item.selectedModel
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          
          return { items: [...state.items, item] };
        });
      },
      
      removeItem: (productId, selectedModel) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.selectedModel === selectedModel)
          ),
        }));
      },
      
      updateQuantity: (productId, selectedModel, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.selectedModel === selectedModel
              ? { ...i, quantity: Math.max(0, quantity) }
              : i
          ).filter((i) => i.quantity > 0),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'itechglass-cart',
    }
  )
);
