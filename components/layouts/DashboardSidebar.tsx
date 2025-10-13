'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Dumbbell,
  Apple,
  BarChart3,
  User,
  Users,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Workouts', href: '/workouts', icon: Dumbbell },
  { name: 'Nutrition', href: '/nutrition', icon: Apple },
  { name: 'Progress', href: '/progress', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Trainer', href: '/trainer', icon: Users },
]

interface DashboardSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  isMobile: boolean
}

export function DashboardSidebar({ sidebarOpen, setSidebarOpen, isMobile }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
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
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl">🥕</span>
              </div>
              <span className="font-bold text-xl">Fitness Carrot</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
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
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">AC</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">Alex Chen</div>
                <div className="text-sm text-muted-foreground truncate">alex@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
