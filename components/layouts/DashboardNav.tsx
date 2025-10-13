'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Menu, X, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface DashboardNavProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  isMobile: boolean
}

export function DashboardNav({ sidebarOpen, setSidebarOpen, isMobile }: DashboardNavProps) {
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">Alex Chen</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    alex@example.com
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
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
