'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    ShieldCheck, ShieldOff, Users, Dumbbell, Star,
    ArrowLeft, Loader2, CheckCircle, XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

interface TrainerDetail {
    trainer: {
        id: string
        name: string | null
        email: string
        image: string | null
        createdAt: string
        trainerProfile: {
            isVerified: boolean
            specializations: string[]
            certifications: string[]
            yearsExperience: number | null
            hourlyRate: number | null
            bio: string | null
            isAcceptingClients: boolean
        } | null
        _count: { assignedClients: number; createdWorkouts: number }
    }
    workouts: {
        id: string
        name: string
        difficulty: string
        isPublic: boolean
        approvalStatus: string
        rejectionReason: string | null
        createdAt: string
        _count: { exercises: number }
    }[]
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'APPROVED') return <Badge className="bg-green-100 text-green-800 border-0"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
    if (status === 'REJECTED') return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">Pending</Badge>
}

export default function TrainerDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [data, setData] = useState<TrainerDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [verifying, setVerifying] = useState(false)

    const fetchTrainer = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/trainers/${id}`)
            if (!res.ok) throw new Error()
            setData(await res.json())
        } catch {
            toast.error('Failed to load trainer')
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => { fetchTrainer() }, [fetchTrainer])

    const handleVerifyToggle = async () => {
        if (!data) return
        setVerifying(true)
        const newStatus = !data.trainer.trainerProfile?.isVerified
        try {
            const res = await fetch(`/api/admin/trainers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: newStatus }),
            })
            if (!res.ok) throw new Error()
            toast.success(newStatus ? 'Trainer verified!' : 'Trainer unverified')
            fetchTrainer()
        } catch {
            toast.error('Failed to update trainer')
        } finally {
            setVerifying(false)
        }
    }

    const handleContentAction = async (itemId: string, contentType: string, approvalStatus: string) => {
        let rejectionReason = ''
        if (approvalStatus === 'REJECTED') {
            const reason = prompt('Please provide a reason for rejection:')
            if (!reason) return
            rejectionReason = reason
        }
        try {
            const res = await fetch('/api/admin/content', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemId, contentType, approvalStatus, rejectionReason }),
            })
            if (!res.ok) throw new Error()
            toast.success(`Content ${approvalStatus.toLowerCase()}`)
            fetchTrainer()
        } catch {
            toast.error('Failed to update content')
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    )

    if (!data) return (
        <div className="text-center py-20 text-muted-foreground">Trainer not found</div>
    )

    const { trainer, workouts } = data

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/trainers"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
                </Button>
            </div>

            {/* Profile card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={trainer.image ?? ''} />
                            <AvatarFallback className="text-2xl">{trainer.name?.[0] ?? 'T'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">{trainer.name || 'No name'}</h2>
                                    <p className="text-muted-foreground">{trainer.email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {trainer.trainerProfile?.isVerified ? (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 px-3 py-1">
                                            <ShieldCheck className="w-4 h-4 mr-1" />Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="px-3 py-1">
                                            <ShieldOff className="w-4 h-4 mr-1" />Unverified
                                        </Badge>
                                    )}
                                    <Button
                                        onClick={handleVerifyToggle}
                                        disabled={verifying || !trainer.trainerProfile}
                                        variant={trainer.trainerProfile?.isVerified ? 'outline' : 'default'}
                                    >
                                        {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                            trainer.trainerProfile?.isVerified
                                                ? <><ShieldOff className="w-4 h-4 mr-2" />Unverify</>
                                                : <><ShieldCheck className="w-4 h-4 mr-2" />Verify Trainer</>}
                                    </Button>
                                </div>
                            </div>

                            {trainer.trainerProfile?.bio && (
                                <p className="text-sm text-muted-foreground">{trainer.trainerProfile.bio}</p>
                            )}

                            {/* Stats row */}
                            <div className="flex flex-wrap gap-6 pt-1">
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{trainer._count.assignedClients}</span>
                                    <span className="text-muted-foreground">clients</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{trainer._count.createdWorkouts}</span>
                                    <span className="text-muted-foreground">workouts</span>
                                </div>
                                {trainer.trainerProfile?.yearsExperience && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <Star className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium">{trainer.trainerProfile.yearsExperience}</span>
                                        <span className="text-muted-foreground">yrs experience</span>
                                    </div>
                                )}
                                {trainer.trainerProfile?.hourlyRate && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <span className="font-medium">${trainer.trainerProfile.hourlyRate}/hr</span>
                                    </div>
                                )}
                            </div>

                            {/* Specializations */}
                            {(trainer.trainerProfile?.specializations.length ?? 0) > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {trainer.trainerProfile!.specializations.map(s => (
                                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                    ))}
                                </div>
                            )}

                            {/* Certifications */}
                            {(trainer.trainerProfile?.certifications.length ?? 0) > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Certifications</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {trainer.trainerProfile!.certifications.map(c => (
                                            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content tabs */}
            <Tabs defaultValue="workouts">
                <TabsList>
                    <TabsTrigger value="workouts">
                        Workouts ({workouts.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="workouts" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trainer Workouts</CardTitle>
                            <CardDescription>Review and approve workouts created by this trainer</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {workouts.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No workouts yet</p>
                            ) : (
                                <div className="rounded-md border">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="p-3 text-left text-sm font-medium">Name</th>
                                                <th className="p-3 text-left text-sm font-medium">Difficulty</th>
                                                <th className="p-3 text-left text-sm font-medium">Exercises</th>
                                                <th className="p-3 text-left text-sm font-medium">Status</th>
                                                <th className="p-3 text-left text-sm font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {workouts.map(workout => (
                                                <tr key={workout.id} className="border-b hover:bg-muted/50">
                                                    <td className="p-3 text-sm font-medium">{workout.name}</td>
                                                    <td className="p-3 text-sm text-muted-foreground">{workout.difficulty}</td>
                                                    <td className="p-3 text-sm text-muted-foreground">{workout._count.exercises}</td>
                                                    <td className="p-3">
                                                        <div>
                                                            <StatusBadge status={workout.approvalStatus} />
                                                            {workout.approvalStatus === 'REJECTED' && workout.rejectionReason && (
                                                                <p className="text-xs text-muted-foreground mt-1">{workout.rejectionReason}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        {workout.approvalStatus !== 'APPROVED' && (
                                                            <Button size="sm" className="mr-2"
                                                                onClick={() => handleContentAction(workout.id, 'workout', 'APPROVED')}>
                                                                <CheckCircle className="w-3 h-3 mr-1" />Approve
                                                            </Button>
                                                        )}
                                                        {workout.approvalStatus !== 'REJECTED' && (
                                                            <Button size="sm" variant="destructive"
                                                                onClick={() => handleContentAction(workout.id, 'workout', 'REJECTED')}>
                                                                <XCircle className="w-3 h-3 mr-1" />Reject
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
