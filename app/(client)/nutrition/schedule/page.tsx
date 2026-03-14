'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, CalendarDays, CalendarRange, CalendarClock, Trash2, Edit, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScheduleForm } from '@/components/features/nutrition/ScheduleForm'

interface MealSchedule {
    id: string
    name: string
    description?: string
    scheduleType: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    startDate: string
    endDate?: string
    isActive: boolean
    scheduledMeals: any[]
    createdAt: string
}

const SCHEDULE_TYPE_LABELS = {
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly',
}

const SCHEDULE_TYPE_ICONS = {
    WEEKLY: CalendarDays,
    MONTHLY: CalendarRange,
    YEARLY: CalendarClock,
}

export default function MealSchedulePage() {
    const [schedules, setSchedules] = useState<MealSchedule[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState<MealSchedule | null>(null)
    const [settingActive, setSettingActive] = useState<string | null>(null)

    const fetchSchedules = async () => {
        try {
            const response = await fetch('/api/meal-schedules')
            if (response.ok) {
                const data = await response.json()
                setSchedules(data)
            }
        } catch (error) {
            console.error('Error fetching schedules:', error)
            toast.error('Unable to load schedule list')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchedules()
    }, [])

    const handleSetActive = async (id: string) => {
        setSettingActive(id)
        try {
            const res = await fetch(`/api/meal-schedules/${id}/set-active`, { method: 'PATCH' })
            if (res.ok) {
                toast.success('Đã chọn lịch active!')
                // Update local state immediately without refetch
                setSchedules(prev => prev.map(s => ({ ...s, isActive: s.id === id })))
            } else {
                toast.error('Không thể set active')
            }
        } catch {
            toast.error('Lỗi kết nối')
        } finally {
            setSettingActive(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        setDeleting(true)
        try {
            const response = await fetch(`/api/meal-schedules/${deleteId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete')
            }

            toast.success('Schedule deleted successfully')
            fetchSchedules()
        } catch (error) {
            console.error('Error deleting schedule:', error)
            toast.error('Unable to delete schedule')
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    const handleEdit = (schedule: MealSchedule) => {
        setEditingSchedule(schedule)
        setFormOpen(true)
    }

    const handleFormClose = () => {
        setFormOpen(false)
        setEditingSchedule(null)
    }

    const handleFormSuccess = () => {
        fetchSchedules()
        handleFormClose()
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Meal Schedule</h1>
                        <p className="text-muted-foreground">Plan meals by week, month, or year</p>
                    </div>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                    Loading...
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Meal Schedule</h1>
                        <p className="text-muted-foreground">Plan meals by week, month, or year</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/nutrition">
                                Back
                            </Link>
                        </Button>
                        <Button size="lg" onClick={() => setFormOpen(true)}>
                            <Plus className="w-5 h-5 mr-2" />
                            Create Schedule
                        </Button>
                    </div>
                </div>

                {/* Active schedule hint */}
                {schedules.length > 1 && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        Bấm <span className="font-semibold text-foreground mx-1">Set Active</span> để chọn lịch đang theo dõi.
                    </div>
                )}

                {/* Schedules List */}
                {schedules.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center text-muted-foreground">
                                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No meal schedules yet</p>
                                <p className="text-sm mt-2">Click "Create Schedule" to get started</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedules.map((schedule) => {
                            const Icon = SCHEDULE_TYPE_ICONS[schedule.scheduleType]
                            const isActive = schedule.isActive
                            return (
                                <Card
                                    key={schedule.id}
                                    className={`hover:shadow-lg transition-all ${isActive ? 'border-primary/50 shadow-primary/10 shadow-md' : ''}`}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2 mb-2">
                                                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    {schedule.name}
                                                </CardTitle>
                                                <div className="flex gap-2 flex-wrap">
                                                    <Badge variant="secondary">
                                                        {SCHEDULE_TYPE_LABELS[schedule.scheduleType]}
                                                    </Badge>
                                                    {isActive && (
                                                        <Badge className="gap-1 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(schedule)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteId(schedule.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {schedule.description && (
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {schedule.description}
                                            </p>
                                        )}
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Start:</span>
                                                <span>{new Date(schedule.startDate).toLocaleDateString('en-US')}</span>
                                            </div>
                                            {schedule.endDate && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">End:</span>
                                                    <span>{new Date(schedule.endDate).toLocaleDateString('en-US')}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Meals:</span>
                                                <span className="font-semibold">{schedule.scheduledMeals.length}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-4">
                                            {!isActive && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                                                    onClick={() => handleSetActive(schedule.id)}
                                                    disabled={settingActive === schedule.id}
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {settingActive === schedule.id ? 'Đang set...' : 'Set Active'}
                                                </Button>
                                            )}
                                            <Button
                                                className={`${isActive ? 'w-full' : 'flex-1'}`}
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={`/nutrition/schedule/${schedule.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this schedule? All scheduled meals will be deleted. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Schedule Form Dialog */}
            <ScheduleForm
                open={formOpen}
                onOpenChange={handleFormClose}
                schedule={editingSchedule}
                onSuccess={handleFormSuccess}
            />
        </>
    )
}
