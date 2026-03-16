'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, Settings, LogOut, ShoppingBag } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useAvatar } from '@/contexts/avatar-context'
import { CartSheet } from '@/components/features/cart/CartSheet'
import { useCartStore } from '@/lib/store/cart'
import { NotificationBell } from '@/components/features/notifications/NotificationBell'

interface DashboardNavProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  isMobile: boolean
}

export function DashboardNav({ sidebarOpen, setSidebarOpen, isMobile }: DashboardNavProps) {
  const { data: session } = useSession()
  const { avatarUrl } = useAvatar()

  const isTrainer = session?.user?.role === 'TRAINER'
  const isAdmin = session?.user?.role === 'ADMIN'

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
    return 'U'
  }

  return (
    <header className="border-b bg-card sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8 lg:py-4">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-lg">🥕</span>
            </div>
            <span className="font-bold">Fitness Carrot</span>
          </div>
        </div>

        {/* Desktop spacer */}
        <div className="hidden lg:block flex-1" />

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationBell />

          {/* Cart */}
          <CartSheet />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl || undefined} alt={session?.user?.name || 'User'} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{session?.user?.email || ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Trainer-specific items */}
              {isTrainer && (
                <DropdownMenuItem asChild>
                  <Link href="/trainer/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              )}

              {/* Admin & Client items */}
              {!isTrainer && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/courses?tab=history" className="cursor-pointer">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={isAdmin ? '/admin/settings' : '/settings'} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  useCartStore.getState().clearCart()
                  signOut({ callbackUrl: '/' })
                }}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
