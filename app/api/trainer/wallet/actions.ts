'use server'

import { db } from '@/lib/server/db/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function updateBankInfo(data: { bankName: string, accountNumber: string, accountName: string }) {
    const session = await auth()
    if (!session || session.user.role !== 'TRAINER') {
        throw new Error('Unauthorized')
    }

    await db.trainerProfile.update({
        where: { userId: session.user.id },
        data: {
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            accountName: data.accountName
        }
    })

    revalidatePath('/trainer/wallet')
    revalidatePath('/trainer/profile')
}

export async function requestPayout(amount: number) {
    const session = await auth()
    if (!session || session.user.role !== 'TRAINER') {
        throw new Error('Unauthorized')
    }

    if (amount <= 0) {
        throw new Error('Invalid amount')
    }

    await db.$transaction(async (tx) => {
        const profile = await tx.trainerProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!profile) {
            throw new Error('Trainer profile not found')
        }

        if (profile.walletBalance < amount) {
            throw new Error('Insufficient balance')
        }

        if (!profile.bankName || !profile.accountNumber || !profile.accountName) {
            throw new Error('Please update your bank information before requesting a payout')
        }

        // 1. Deduct balance
        await tx.trainerProfile.update({
            where: { userId: session.user.id },
            data: { walletBalance: { decrement: amount } }
        })

        // 2. Create Payout Request
        const request = await tx.payoutRequest.create({
            data: {
                trainerId: session.user.id,
                amount: amount,
                bankName: profile.bankName,
                accountNumber: profile.accountNumber,
                accountName: profile.accountName,
                status: 'PENDING'
            }
        })

        // 3. Log Transaction
        await tx.transaction.create({
            data: {
                userId: session.user.id,
                amount: amount,
                type: 'WITHDRAWAL',
                status: 'PENDING',
                description: `Payout Request`,
                referenceId: request.id
            }
        })
    })

    revalidatePath('/trainer/wallet')
}
