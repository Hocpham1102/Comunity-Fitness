import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    title: string
    price: number
    currency: string
    thumbnailUrl: string | null
    trainerName?: string | null
}

interface CartState {
    userId: string | null
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    clearCart: () => void
    syncUser: (currentUserId: string | null) => void
    initializeCart: (items: CartItem[]) => void
    totalItems: () => number
    totalPrice: () => number
    hasItem: (id: string) => boolean
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            userId: null,
            items: [],
            addItem: (item: CartItem) => {
                set((state) => {
                    if (state.items.find((i) => i.id === item.id)) {
                        return state // Do not add duplicates
                    }
                    return { items: [...state.items, item] }
                })
            },
            removeItem: (id: string) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }))
            },
            clearCart: () => set({ items: [], userId: get().userId }), // Keeps known user ID
            syncUser: (currentUserId: string | null) => {
                const storedUserId = get().userId;
                // If there's a stored user and it's different from the current (e.g. changed account or logged out), clear cart 
                if (storedUserId !== null && storedUserId !== currentUserId) {
                    set({ items: [], userId: currentUserId });
                } else if (storedUserId === null && currentUserId !== null) {
                    // Claim the anonymous cart for the logging-in user
                    set({ userId: currentUserId });
                } else if (currentUserId === null) {
                    // Logged out
                    set({ items: [], userId: null });
                }
            },
            initializeCart: (newItems: CartItem[]) => {
                set({ items: newItems })
            },
            totalItems: () => get().items.length,
            totalPrice: () => get().items.reduce((total, item) => total + item.price, 0),
            hasItem: (id: string) => get().items.some(item => item.id === id)
        }),
        {
            name: 'fitness-cart-storage',
        }
    )
)
