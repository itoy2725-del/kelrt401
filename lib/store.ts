import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from './types';

interface CartStore {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, amount: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getItemCount: () => number;
}

// Sepet toplam tutarını hesapla
const calculateCartTotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => {
        const price = item.product?.price || 0;
        return total + (price * item.amount);
    }, 0);
};

// Sepet değişikliğini API'ye bildir
const syncCartToServer = async (productId: number, amount: number, items: CartItem[]) => {
    try {
        const cartTotal = calculateCartTotal(items);
        await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, amount, cart_total: cartTotal })
        });
    } catch (error) {
        console.error('Sepet senkronizasyon hatası:', error);
    }
};

const removeFromServer = async (productId: number) => {
    try {
        await fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId })
        });
    } catch (error) {
        console.error('Sepet silme hatası:', error);
    }
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            
            addItem: (product: Product) => {
                set((state) => {
                    const existingItem = state.items.find(item => item.product_id === product.id);
                    if (existingItem && existingItem.amount >= 2) {
                        return { items: state.items };
                    }
                    const newAmount = existingItem ? existingItem.amount + 1 : 1;
                    
                    let newItems: CartItem[];
                    
                    if (existingItem) {
                        newItems = state.items.map(item =>
                            item.product_id === product.id
                                ? { ...item, amount: item.amount + 1 }
                                : item
                        );
                    } else {
                        newItems = [...state.items, {
                            id: Date.now(),
                            product_id: product.id,
                            amount: 1,
                            product
                        }];
                    }
                    
                    // API'ye bildir (yeni items ile)
                    syncCartToServer(product.id, newAmount, newItems);
                    
                    return { items: newItems };
                });
            },
            
            removeItem: (productId: number) => {
                // API'ye bildir
                removeFromServer(productId);
                
                set((state) => ({
                    items: state.items.filter(item => item.product_id !== productId)
                }));
            },
            
            updateQuantity: (productId: number, amount: number) => {
                if (amount <= 0) {
                    get().removeItem(productId);
                    return;
                }
                const finalAmount = amount > 2 ? 2 : amount;
                
                set((state) => {
                    const newItems = state.items.map(item =>
                        item.product_id === productId
                            ? { ...item, amount: finalAmount }
                            : item
                    );
                    
                    // API'ye bildir (yeni items ile)
                    syncCartToServer(productId, finalAmount, newItems);
                    
                    return { items: newItems };
                });
            },
            
            clearCart: () => set({ items: [] }),
            
            getTotalPrice: () => {
                const state = get();
                return calculateCartTotal(state.items);
            },
            
            getItemCount: () => {
                const state = get();
                return state.items.reduce((count, item) => count + item.amount, 0);
            },
        }),
        { name: 'cart-storage' }
    )
);