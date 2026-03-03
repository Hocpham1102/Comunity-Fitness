'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ShieldOff, ShieldCheck, Clock } from 'lucide-react'
import Link from 'next/link'

type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | null

interface VerificationGateProps {
    children: React.ReactNode
    /** 
     * If true, children are always shown but a banner is added for unverified trainers.
     * If false (default), children are hidden until verified.
     */
    softBlock?: boolean
}

export function VerificationGate({ children, softBlock = false }: VerificationGateProps) {
    const { data: session } = useSession()
    const [status, setStatus] = useState<Status>(null)
    const [isVerified, setIsVerified] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch('/api/trainer/verification-request')
                if (res.ok) {
                    const data = await res.json()
                    setStatus(data.request?.status ?? null)
                    // Use TrainerProfile.isVerified as the authoritative source
                    setIsVerified(data.isVerified ?? false)
                }
            } catch {
                // ignore
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.id) fetch_()
    }, [session?.user?.id])

    const isPending = status === 'PENDING'
    const isRejected = status === 'REJECTED'
    const notRequested = status === null

    if (loading) return <>{children}</>

    const banner = (
        <Alert className={`mb-6 ${isPending
            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
            : 'border-orange-400 bg-orange-50 dark:bg-orange-950/20'
            }`}>
            {isPending
                ? <Clock className="h-4 w-4 text-yellow-600" />
                : <ShieldOff className="h-4 w-4 text-orange-500" />
            }
            <AlertTitle className={isPending ? 'text-yellow-700 dark:text-yellow-400' : 'text-orange-700 dark:text-orange-400'}>
                {isPending ? 'Verification Pending' : 'Verification Required'}
            </AlertTitle>
            <AlertDescription className="flex items-center gap-3 flex-wrap">
                <span className={isPending ? 'text-yellow-600 dark:text-yellow-500' : 'text-orange-600 dark:text-orange-500'}>
                    {isPending
                        ? 'Your verification request is under review. Some features may be limited until approved.'
                        : isRejected
                            ? 'Your verification was rejected. Please update and resubmit to unlock all features.'
                            : 'You need to be a verified trainer to use this feature.'}
                </span>
                {!isPending && (
                    <Button size="sm" asChild variant="default">
                        <Link href="/trainer/verification">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {isRejected ? 'Resubmit Request' : 'Request Verification →'}
                        </Link>
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    )

    if (!isVerified && !softBlock) {
        // Hard block: show banner but hide content
        return (
            <div>
                {banner}
                <div className="opacity-40 pointer-events-none select-none" aria-hidden>
                    {children}
                </div>
            </div>
        )
    }

    if (!isVerified && softBlock) {
        // Soft block: show banner but still allow access
        return (
            <div>
                {banner}
                {children}
            </div>
        )
    }

    // Verified – render normally
    return <>{children}</>
}
