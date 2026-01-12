'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface AvatarContextType {
    avatarUrl: string | null
    updateAvatar: (url: string) => void
    deleteAvatar: () => void
    refreshAvatar: () => Promise<void>
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined)

export function AvatarProvider({ children }: { children: ReactNode }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const { data: session } = useSession()

    // Fetch avatar from API
    const refreshAvatar = async () => {
        try {
            const response = await fetch('/api/profile')
            if (response.ok) {
                const data = await response.json()
                setAvatarUrl(data.image || null)
            }
        } catch (error) {
            console.error('Error fetching avatar:', error)
        }
    }

    // Load avatar on mount and when session changes
    useEffect(() => {
        if (session?.user?.id) {
            refreshAvatar()
        }
    }, [session?.user?.id])

    // Update avatar (called after successful upload)
    const updateAvatar = (url: string) => {
        setAvatarUrl(url)
    }

    // Delete avatar (called after successful deletion)
    const deleteAvatar = () => {
        setAvatarUrl(null)
    }

    return (
        <AvatarContext.Provider value={{ avatarUrl, updateAvatar, deleteAvatar, refreshAvatar }}>
            {children}
        </AvatarContext.Provider>
    )
}

// Custom hook to use avatar context
export function useAvatar() {
    const context = useContext(AvatarContext)
    if (context === undefined) {
        throw new Error('useAvatar must be used within an AvatarProvider')
    }
    return context
}
