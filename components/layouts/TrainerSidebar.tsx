'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Home,
    Users,
    Dumbbell,
    Apple,
    BookOpen,
    BarChart3,
    User,
    X,
    Activity,
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/trainer/dashboard', icon: Home },
    { name: 'My Clients', href: '/trainer/clients', icon: Users },
    { name: 'Workout Templates', href: '/trainer/workouts', icon: Dumbbell },
    { name: 'My Exercises', href: '/trainer/exercises', icon: Activity },
    { name: 'Meal Plans', href: '/trainer/nutrition', icon: Apple },
    { name: 'My Courses', href: '/trainer/courses', icon: BookOpen },
    { name: 'Analytics', href: '/trainer/analytics', icon: BarChart3 },
    { name: 'Trainer Profile', href: '/trainer/profile', icon: User },
]

interface TrainerSidebarProps {
    readonly sidebarOpen: boolean
    readonly setSidebarOpen: (open: boolean) => void
    readonly isMobile: boolean
}

export function TrainerSidebar({ sidebarOpen, setSidebarOpen, isMobile }: TrainerSidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    // Load avatar from API
    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const response = await fetch('/api/profile')
                if (response.ok) {
                    const data = await response.json()
                    setAvatarUrl(data.image)
                }
            } catch (error) {
                console.error('Error fetching avatar:', error)
            }
        }

        if (session?.user?.id) {
            fetchAvatar()
        }
    }, [session?.user?.id])

    // Generate initials from name or email
    const getInitials = () => {
        if (session?.user?.name) {
            return session.user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        if (session?.user?.email) {
            return session.user.email.slice(0, 2).toUpperCase()
        }
        return 'T'
    }

    // Handle Escape key to close sidebar on mobile
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && sidebarOpen && isMobile) {
                setSidebarOpen(false)
            }
        }

        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [sidebarOpen, isMobile, setSidebarOpen])

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && isMobile && (
                <button
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transition-transform duration-300 lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b flex items-center justify-between">
                        <Link href="/trainer/dashboard" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-2xl">💪</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl">Fitness Carrot</span>
                                <span className="text-xs text-muted-foreground">Trainer Portal</span>
                            </div>
                        </Link>
                        {/* Close button - mobile only */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => isMobile && setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t">
                        <Link href="/trainer/profile" onClick={() => isMobile && setSidebarOpen(false)}>
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-medium text-primary-foreground">{getInitials()}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{session?.user?.name || 'Trainer'}</div>
                                    <div className="text-sm text-muted-foreground truncate">{session?.user?.email || ''}</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    )
}
