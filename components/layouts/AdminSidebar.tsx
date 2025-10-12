'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Users,
  UserCheck,
  Package,
  BarChart3,
  Settings,
  Shield,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Trainers', href: '/admin/trainers', icon: UserCheck },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 flex flex-col bg-gray-900">
      <div className="flex items-center h-16 px-4 border-b border-gray-700">
        <Shield className="h-8 w-8 text-orange-400" />
        <span className="ml-2 text-lg font-semibold text-white">
          Admin Panel
        </span>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 flex-shrink-0 h-5 w-5',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
