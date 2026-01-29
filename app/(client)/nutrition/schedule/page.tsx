'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, CalendarDays, CalendarRange, CalendarClock, Trash2, Edit } from "lucide-react"
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
    WEEKLY: 'Theo Tuần',
    MONTHLY: 'Theo Tháng',
    YEARLY: 'Theo Năm',
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

    const fetchSchedules = async () => {
        try {
            const response = await fetch('/api/meal-schedules')
            if (response.ok) {
                const data = await response.json()
                setSchedules(data)
            }
        } catch (error) {
            console.error('Error fetching schedules:', error)
            toast.error('Không thể tải danh sách lịch')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchedules()
    }, [])

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

            toast.success('Đã xóa lịch thành công')
            fetchSchedules()
        } catch (error) {
            console.error('Error deleting schedule:', error)
            toast.error('Không thể xóa lịch')
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
                        <h1 className="text-3xl font-bold mb-2">Lịch Bữa Ăn</h1>
                        <p className="text-muted-foreground">Lên kế hoạch bữa ăn theo tuần, tháng, năm</p>
                    </div>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                    Đang tải...
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
                        <h1 className="text-3xl font-bold mb-2">Lịch Bữa Ăn</h1>
                        <p className="text-muted-foreground">Lên kế hoạch bữa ăn theo tuần, tháng, năm</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/nutrition">
                                Quay lại
                            </Link>
                        </Button>
                        <Button size="lg" onClick={() => setFormOpen(true)}>
                            <Plus className="w-5 h-5 mr-2" />
                            Tạo Lịch
                        </Button>
                    </div>
                </div>

                {/* Schedules List */}
                {schedules.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center text-muted-foreground">
                                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Chưa có lịch bữa ăn nào</p>
                                <p className="text-sm mt-2">Click "Tạo Lịch" để bắt đầu</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedules.map((schedule) => {
                            const Icon = SCHEDULE_TYPE_ICONS[schedule.scheduleType]
                            return (
                                <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2 mb-2">
                                                    <Icon className="w-5 h-5 text-primary" />
                                                    {schedule.name}
                                                </CardTitle>
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary">
                                                        {SCHEDULE_TYPE_LABELS[schedule.scheduleType]}
                                                    </Badge>
                                                    {schedule.isActive && (
                                                        <Badge variant="default">Đang hoạt động</Badge>
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
                                                <span className="text-muted-foreground">Bắt đầu:</span>
                                                <span>{new Date(schedule.startDate).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            {schedule.endDate && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Kết thúc:</span>
                                                    <span>{new Date(schedule.endDate).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Số bữa ăn:</span>
                                                <span className="font-semibold">{schedule.scheduledMeals.length}</span>
                                            </div>
                                        </div>
                                        <Button className="w-full mt-4" asChild>
                                            <Link href={`/nutrition/schedule/${schedule.id}`}>
                                                Xem Chi Tiết
                                            </Link>
                                        </Button>
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
                        <AlertDialogTitle>Xác Nhận Xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa lịch này? Tất cả bữa ăn đã lên lịch sẽ bị xóa. Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Đang xóa...' : 'Xóa'}
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
