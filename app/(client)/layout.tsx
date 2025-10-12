import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { DashboardNav } from '@/components/layouts/DashboardNav'
import { MobileNav } from '@/components/layouts/MobileNav'
import { useIsMobile } from '@/lib/client/hooks/useIsMobile'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardNav />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        <DashboardNav />
        <main className="flex-1 p-4 pb-20">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
