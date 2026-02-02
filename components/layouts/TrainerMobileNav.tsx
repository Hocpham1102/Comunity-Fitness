'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Home,
    Users,
    Dumbbell,
    BarChart3,
    Activity,
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/trainer/dashboard', icon: Home },
    { name: 'Clients', href: '/trainer/clients', icon: Users },
    { name: 'Workouts', href: '/trainer/workouts', icon: Dumbbell },
    { name: 'Exercises', href: '/trainer/exercises', icon: Activity },
    { name: 'Analytics', href: '/trainer/analytics', icon: BarChart3 },
]

export function TrainerMobileNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-40 lg:hidden">
            <div className="flex items-center justify-around px-2 py-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0",
                                isActive ? "text-primary" : "text-muted-foreground",
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-xs font-medium truncate">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
