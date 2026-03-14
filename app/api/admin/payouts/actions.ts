'use server'

import { db } from '@/lib/server/db/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function approvePayoutRequest(payoutId: string) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    await db.$transaction(async (tx) => {
        const payout = await tx.payoutRequest.findUnique({
            where: { id: payoutId }
        })

        if (!payout || payout.status !== 'PENDING') {
            throw new Error('Invalid payout request')
        }

        // 1. Mark Payout as Approved
        await tx.payoutRequest.update({
            where: { id: payoutId },
            data: {
                status: 'APPROVED',
                reviewedById: session.user.id,
                reviewedAt: new Date()
            }
        })

        // 2. Mark Transaction as Completed
        await tx.transaction.updateMany({
            where: { referenceId: payoutId, type: 'WITHDRAWAL' },
            data: { status: 'COMPLETED' }
        })
    })

    revalidatePath('/admin/payouts')
}

export async function rejectPayoutRequest(payoutId: string, reason: string) {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    await db.$transaction(async (tx) => {
        const payout = await tx.payoutRequest.findUnique({
            where: { id: payoutId }
        })

        if (!payout || payout.status !== 'PENDING') {
            throw new Error('Invalid payout request')
        }

        // 1. Mark Payout as Rejected
        await tx.payoutRequest.update({
            where: { id: payoutId },
            data: {
                status: 'REJECTED',
                adminNote: reason,
                reviewedById: session.user.id,
                reviewedAt: new Date()
            }
        })

        // 2. Refund Wallet Balance
        await tx.trainerProfile.update({
            where: { userId: payout.trainerId },
            data: { walletBalance: { increment: payout.amount } }
        })

        // 3. Mark Transaction as Failed
        await tx.transaction.updateMany({
            where: { referenceId: payoutId, type: 'WITHDRAWAL' },
            data: { status: 'FAILED' }
        })
    })

    revalidatePath('/admin/payouts')
}
