'use client'

import { useState } from 'react'
import { TrainerSidebar } from '@/components/layouts/TrainerSidebar'
import { DashboardNav } from '@/components/layouts/DashboardNav'
import { TrainerMobileNav } from '@/components/layouts/TrainerMobileNav'
import { useMobile } from '@/hooks/use-mobile'

export default function TrainerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const isMobile = useMobile()

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <TrainerSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isMobile={isMobile}
            />

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Header */}
                <DashboardNav
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isMobile={isMobile}
                />

                {/* Page Content */}
                <main className="p-4 lg:p-8 pb-20 lg:pb-8">{children}</main>
            </div>

            {/* Mobile Bottom Navigation */}
            {isMobile && <TrainerMobileNav />}
        </div>
    )
}
