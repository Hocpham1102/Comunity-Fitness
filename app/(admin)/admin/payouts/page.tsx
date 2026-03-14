import { redirect } from 'next/navigation'
import { db } from '@/lib/server/db/prisma'
import { auth } from '@/auth'
import PayoutsClient from './payouts-client'

export const dynamic = 'force-dynamic'

export default async function AdminPayoutsPage() {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/')
    }

    const payoutRequests = await db.payoutRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            trainer: { select: { name: true, email: true } },
            reviewedBy: { select: { name: true } }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payout Requests</h1>
                    <p className="text-gray-500 mt-1">Review and process trainer withdrawal requests.</p>
                </div>
            </div>

            <PayoutsClient payoutRequests={payoutRequests} />
        </div>
    )
}
