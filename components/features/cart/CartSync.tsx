'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/lib/store/cart'

export function CartSync() {
    const { data: session, status } = useSession()
    const { syncUser, initializeCart, items } = useCartStore()
    const isInitialLoad = useRef(true)

    // 1. Handle User Login / Session Changes
    useEffect(() => {
        if (status === 'loading') return

        const currentUserId = session?.user?.id || null
        syncUser(currentUserId)

        // If a user just logged in, fetch their saved cart from the database
        if (currentUserId) {
            fetch('/api/cart/sync')
                .then(res => res.json())
                .then(data => {
                    if (data.items) {
                        // Option 1: Overwrite local cart with DB cart
                        // Option 2: Merge local (anonymous) cart with DB cart
                        // For simplicity and matching common e-commerce, let's just initialize with DB cart for now.
                        // If we wanted to merge, we'd combine `items` and `data.items` and then POST the merged result.

                        // To be smart: If local cart has items, and DB cart has items, merge them.
                        const localItems = useCartStore.getState().items
                        if (localItems.length > 0) {
                            const merged = [...data.items];
                            for (const localItem of localItems) {
                                if (!merged.find(i => i.id === localItem.id)) {
                                    merged.push(localItem)
                                }
                            }
                            initializeCart(merged)
                        } else {
                            initializeCart(data.items)
                        }
                    }
                })
                .catch(err => console.error('Failed to load cart from DB:', err))
                .finally(() => {
                    isInitialLoad.current = false
                })
        } else {
            isInitialLoad.current = false
        }
    }, [session?.user?.id, status, syncUser, initializeCart])

    // 2. Sync changes back to Database whenever the cart changes
    useEffect(() => {
        if (status === 'loading' || isInitialLoad.current) return
        if (!session?.user?.id) return

        // Debounce the sync to avoid spamming the database on rapid clicks
        const timeoutId = setTimeout(() => {
            fetch('/api/cart/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            }).catch(err => console.error('Failed to sync cart to DB:', err))
        }, 1000)

        return () => clearTimeout(timeoutId)
    }, [items, session?.user?.id, status])

    return null
}
