import { redirect } from 'next/navigation'
import { db } from '@/lib/server/db/prisma'
import { auth } from '@/auth'
import WalletClient from './wallet-client'

export const dynamic = 'force-dynamic'

export default async function TrainerWalletPage() {
    const session = await auth()
    if (!session || session.user.role !== 'TRAINER') {
        redirect('/')
    }

    const trainerProfile = await db.trainerProfile.findUnique({
        where: { userId: session.user.id }
    })

    if (!trainerProfile) {
        redirect('/trainer/profile')
    }

    const transactions = await db.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
    })

    const payoutRequests = await db.payoutRequest.findMany({
        where: { trainerId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
    })

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Wallet & Payouts</h1>
            </div>

            <WalletClient
                profile={trainerProfile}
                transactions={transactions}
                payoutRequests={payoutRequests}
            />
        </div>
    )
}
