'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, AlertTriangle } from 'lucide-react'

export function AdminNav() {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6">
        <div className="flex justify-between items-center h-16">
          {/* Admin Banner */}
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Admin Mode</span>
            <Badge variant="secondary" className="text-xs">
              Restricted Access
            </Badge>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                5
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
