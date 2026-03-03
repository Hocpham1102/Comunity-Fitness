'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    ShieldCheck,
    Settings,
    LogOut,
    ChevronUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const navigation = [
    { name: 'Dashboard', href: '/trainer/dashboard', icon: Home },
    { name: 'My Clients', href: '/trainer/clients', icon: Users },
    { name: 'Workout Templates', href: '/trainer/workouts', icon: Dumbbell },
    { name: 'My Exercises', href: '/trainer/exercises', icon: Activity },
    { name: 'Meal Plans', href: '/trainer/nutrition', icon: Apple },
    { name: 'My Courses', href: '/trainer/courses', icon: BookOpen },
    { name: 'Analytics', href: '/trainer/analytics', icon: BarChart3 },
    { name: 'Verification', href: '/trainer/verification', icon: ShieldCheck, sublabel: 'Unlock features' },
    { name: 'Trainer Profile', href: '/trainer/profile', icon: User, sublabel: 'Your public info' },
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
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null)

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

        const fetchVerification = async () => {
            try {
                const res = await fetch('/api/trainer/verification-request')
                if (res.ok) {
                    const data = await res.json()
                    setVerificationStatus(data.request?.status ?? null)
                }
            } catch {
                // ignore
            }
        }

        if (session?.user?.id) {
            fetchAvatar()
            fetchVerification()
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
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => isMobile && setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <item.icon className="w-5 h-5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-medium block leading-tight">{item.name}</span>
                                        {item.sublabel && (
                                            <span className={cn(
                                                "text-[10px] leading-tight block",
                                                isActive ? "text-primary-foreground/70" : "text-muted-foreground/70"
                                            )}>{item.sublabel}</span>
                                        )}
                                    </div>
                                    {item.name === 'Verification' && (
                                        verificationStatus === 'APPROVED' ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs px-1.5 py-0">✓</Badge>
                                        ) : verificationStatus === 'PENDING' ? (
                                            <Badge variant="secondary" className="text-xs px-1.5 py-0">…</Badge>
                                        ) : verificationStatus === 'REJECTED' ? (
                                            <Badge variant="destructive" className="text-xs px-1.5 py-0">!</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs px-1.5 py-0">New</Badge>
                                        )
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile Dropdown */}
                    <div className="p-4 border-t">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left">
                                    <Avatar className="h-9 w-9 shrink-0">
                                        <AvatarImage src={avatarUrl ?? undefined} alt={session?.user?.name ?? 'Trainer'} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                                            {getInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{session?.user?.name || 'Trainer'}</div>
                                        <div className="text-xs text-muted-foreground truncate">{session?.user?.email || ''}</div>
                                    </div>
                                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mb-1" side="top" align="start" sideOffset={8}>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-0.5">
                                        <p className="text-sm font-medium">{session?.user?.name || 'Trainer'}</p>
                                        <p className="text-xs text-muted-foreground truncate">{session?.user?.email || ''}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/trainer/settings" onClick={() => isMobile && setSidebarOpen(false)} className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>
        </>
    )
}
