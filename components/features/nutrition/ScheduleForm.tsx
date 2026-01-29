'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface ScheduleFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    schedule?: any
    onSuccess: () => void
}

export function ScheduleForm({ open, onOpenChange, schedule, onSuccess }: ScheduleFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        scheduleType: 'WEEKLY' as 'WEEKLY' | 'MONTHLY' | 'YEARLY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
    })

    useEffect(() => {
        if (schedule) {
            setFormData({
                name: schedule.name || '',
                description: schedule.description || '',
                scheduleType: schedule.scheduleType || 'WEEKLY',
                startDate: schedule.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : '',
                endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : '',
            })
        } else {
            setFormData({
                name: '',
                description: '',
                scheduleType: 'WEEKLY',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
            })
        }
    }, [schedule, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = schedule
                ? `/api/meal-schedules/${schedule.id}`
                : '/api/meal-schedules'

            const method = schedule ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    endDate: formData.endDate || null,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to save schedule')
            }

            toast.success(schedule ? 'Đã cập nhật lịch' : 'Đã tạo lịch mới')
            onSuccess()
        } catch (error) {
            console.error('Error saving schedule:', error)
            toast.error('Không thể lưu lịch')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{schedule ? 'Chỉnh Sửa Lịch' : 'Tạo Lịch Mới'}</DialogTitle>
                    <DialogDescription>
                        {schedule ? 'Cập nhật thông tin lịch bữa ăn' : 'Tạo lịch bữa ăn mới theo tuần, tháng hoặc năm'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tên Lịch *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ví dụ: Kế hoạch ăn tuần 1"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô Tả</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Mô tả ngắn về lịch này..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="scheduleType">Loại Lịch *</Label>
                        <Select
                            value={formData.scheduleType}
                            onValueChange={(value: any) => setFormData({ ...formData, scheduleType: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WEEKLY">Theo Tuần</SelectItem>
                                <SelectItem value="MONTHLY">Theo Tháng</SelectItem>
                                <SelectItem value="YEARLY">Theo Năm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Ngày Bắt Đầu *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">Ngày Kết Thúc</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Đang lưu...' : schedule ? 'Cập Nhật' : 'Tạo Lịch'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
