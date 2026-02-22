'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, User, Mail, Phone, Calendar, Activity, Dumbbell, Apple } from 'lucide-react'
import { format } from 'date-fns'

interface UserDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userId: string | null
}

export function UserDetailsDialog({ open, onOpenChange, userId }: UserDetailsDialogProps) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && userId) {
            setUser(null)
            fetchUserDetails()
        }
    }, [open, userId])

    const fetchUserDetails = async () => {
        if (!userId) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${userId}`)
            if (res.ok) {
                const data = await res.json()
                setUser(data)
            }
        } catch (error) {
            console.error('Failed to fetch user details:', error)
        } finally {
            setLoading(false)
        }
    }

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'destructive'
            case 'TRAINER':
                return 'default'
            default:
                return 'secondary'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                    <DialogDescription>
                        Detailed information about this user
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : user ? (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold">Basic Information</h3>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{user.name || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{user.email}</span>
                                    {user.emailVerified && (
                                        <Badge variant="outline" className="text-xs">
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                                {user.phoneNumber && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{user.phoneNumber}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Joined {format(new Date(user.createdAt), 'PPP')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Role:</span>
                                    <Badge variant={getRoleBadgeVariant(user.role)}>
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Activity Stats */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Activity Statistics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Workouts</span>
                                    </div>
                                    <p className="text-2xl font-bold">{user._count.workoutLogs}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Apple className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Nutrition Logs</span>
                                    </div>
                                    <p className="text-2xl font-bold">{user._count.nutritionLogs}</p>
                                </div>
                                {user.role === 'TRAINER' && (
                                    <>
                                        <div className="space-y-1">
                                            <span className="text-sm text-muted-foreground">Clients</span>
                                            <p className="text-2xl font-bold">{user._count.assignedClients}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-sm text-muted-foreground">Created Workouts</span>
                                            <p className="text-2xl font-bold">{user._count.createdWorkouts}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Profile Info */}
                        {user.profile && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold">Profile Information</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {user.profile.gender && (
                                            <div>
                                                <span className="text-muted-foreground">Gender:</span>{' '}
                                                <span className="font-medium">{user.profile.gender}</span>
                                            </div>
                                        )}
                                        {user.profile.height && (
                                            <div>
                                                <span className="text-muted-foreground">Height:</span>{' '}
                                                <span className="font-medium">{user.profile.height} cm</span>
                                            </div>
                                        )}
                                        {user.profile.currentWeight && (
                                            <div>
                                                <span className="text-muted-foreground">Current Weight:</span>{' '}
                                                <span className="font-medium">{user.profile.currentWeight} kg</span>
                                            </div>
                                        )}
                                        {user.profile.targetWeight && (
                                            <div>
                                                <span className="text-muted-foreground">Target Weight:</span>{' '}
                                                <span className="font-medium">{user.profile.targetWeight} kg</span>
                                            </div>
                                        )}
                                        {user.profile.fitnessGoal && (
                                            <div>
                                                <span className="text-muted-foreground">Fitness Goal:</span>{' '}
                                                <span className="font-medium">{user.profile.fitnessGoal.replace(/_/g, ' ')}</span>
                                            </div>
                                        )}
                                        {user.profile.activityLevel && (
                                            <div>
                                                <span className="text-muted-foreground">Activity Level:</span>{' '}
                                                <span className="font-medium">{user.profile.activityLevel.replace(/_/g, ' ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Trainer Profile */}
                        {user.trainerProfile && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold">Trainer Profile</h3>
                                    <div className="space-y-2 text-sm">
                                        {user.trainerProfile.bio && (
                                            <div>
                                                <span className="text-muted-foreground">Bio:</span>
                                                <p className="mt-1">{user.trainerProfile.bio}</p>
                                            </div>
                                        )}
                                        {user.trainerProfile.yearsExperience && (
                                            <div>
                                                <span className="text-muted-foreground">Experience:</span>{' '}
                                                <span className="font-medium">{user.trainerProfile.yearsExperience} years</span>
                                            </div>
                                        )}
                                        {user.trainerProfile.specializations?.length > 0 && (
                                            <div>
                                                <span className="text-muted-foreground">Specializations:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {user.trainerProfile.specializations.map((spec: string) => (
                                                        <Badge key={spec} variant="secondary" className="text-xs">
                                                            {spec}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {user.trainerProfile.certifications?.length > 0 && (
                                            <div>
                                                <span className="text-muted-foreground">Certifications:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {user.trainerProfile.certifications.map((cert: string) => (
                                                        <Badge key={cert} variant="outline" className="text-xs">
                                                            {cert}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-4">
                                            <div>
                                                <span className="text-muted-foreground">Verified:</span>{' '}
                                                <Badge variant={user.trainerProfile.isVerified ? 'default' : 'secondary'}>
                                                    {user.trainerProfile.isVerified ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Accepting Clients:</span>{' '}
                                                <Badge variant={user.trainerProfile.isAcceptingClients ? 'default' : 'secondary'}>
                                                    {user.trainerProfile.isAcceptingClients ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No user data available
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
