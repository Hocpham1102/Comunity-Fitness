'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Users, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { addWeeks, addMonths, format } from 'date-fns'

interface Client {
    id: string
    name: string
    email: string
}

interface MealPlan {
    id: string
    name: string
    meals: any[]
}

interface CreateScheduleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mealPlan: MealPlan | null
    onScheduleCreated?: () => void
}

type ScheduleType = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

const SCHEDULE_TYPES = [
    {
        value: 'WEEKLY' as ScheduleType,
        label: 'Hàng tuần',
        icon: CalendarDays,
        description: 'Lặp lại mỗi tuần',
        defaultDuration: 'tuần',
        defaultCount: 4,
    },
    {
        value: 'MONTHLY' as ScheduleType,
        label: 'Hàng tháng',
        icon: Calendar,
        description: 'Lặp lại mỗi tháng',
        defaultDuration: 'tháng',
        defaultCount: 3,
    },
    {
        value: 'YEARLY' as ScheduleType,
        label: 'Hàng năm',
        icon: Clock,
        description: 'Lặp lại mỗi năm',
        defaultDuration: 'năm',
        defaultCount: 1,
    },
]

export function CreateScheduleDialog({
    open,
    onOpenChange,
    mealPlan,
    onScheduleCreated,
}: CreateScheduleDialogProps) {
    const [clients, setClients] = useState<Client[]>([])
    const [loadingClients, setLoadingClients] = useState(false)
    const [selectedClientId, setSelectedClientId] = useState<string>('')
    const [scheduleType, setScheduleType] = useState<ScheduleType>('WEEKLY')
    const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState<string>('')
    const [scheduleName, setScheduleName] = useState('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Load clients when dialog opens
    useEffect(() => {
        if (open) {
            fetchClients()
        }
    }, [open])

    // Auto-fill schedule name when meal plan changes
    useEffect(() => {
        if (mealPlan) {
            setScheduleName(`Lịch: ${mealPlan.name}`)
        }
    }, [mealPlan])

    // Auto-calculate end date when start date or schedule type changes
    useEffect(() => {
        if (startDate) {
            const start = new Date(startDate)
            let calculatedEndDate: Date

            switch (scheduleType) {
                case 'WEEKLY':
                    calculatedEndDate = addWeeks(start, 4)
                    break
                case 'MONTHLY':
                    calculatedEndDate = addMonths(start, 3)
                    break
                case 'YEARLY':
                    calculatedEndDate = addMonths(start, 12)
                    break
                default:
                    calculatedEndDate = addWeeks(start, 4)
            }

            setEndDate(format(calculatedEndDate, 'yyyy-MM-dd'))
        }
    }, [startDate, scheduleType])

    const fetchClients = async () => {
        setLoadingClients(true)
        try {
            const response = await fetch('/api/trainer/clients')
            if (response.ok) {
                const data = await response.json()
                setClients(data.clients || [])
            } else {
                toast.error('Không thể tải danh sách clients')
            }
        } catch (error) {
            console.error('Error fetching clients:', error)
            toast.error('Lỗi khi tải danh sách clients')
        } finally {
            setLoadingClients(false)
        }
    }

    const calculatePreview = () => {
        if (!mealPlan || !startDate || !endDate) return null

        const start = new Date(startDate)
        const end = new Date(endDate)

        // Correct calculation for multi-day cycles
        const planCycleDays = (mealPlan as any).cycleDays || 7
        const mealsInCycle = (mealPlan as any).mealCount || mealPlan.meals?.length || 0

        const durationMs = end.getTime() - start.getTime()
        const durationDays = Math.ceil(durationMs / (24 * 60 * 60 * 1000)) + 1 // Inclusive

        const numberOfCycles = durationDays / planCycleDays
        const totalMeals = Math.round(mealsInCycle * numberOfCycles)

        const scheduleInfo = SCHEDULE_TYPES.find(t => t.value === scheduleType)

        return {
            totalMeals,
            duration: durationDays,
            mealsInCycle,
            cycleDays: planCycleDays,
            durationType: scheduleInfo?.defaultDuration || 'tuần',
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedClientId) {
            toast.error('Vui lòng chọn client')
            return
        }

        if (!mealPlan) {
            toast.error('Không có meal plan')
            return
        }

        if (!startDate) {
            toast.error('Vui lòng chọn ngày bắt đầu')
            return
        }

        setSubmitting(true)

        try {
            const response = await fetch(`/api/trainer/meal-plans/${mealPlan.id}/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: selectedClientId,
                    scheduleType,
                    startDate: new Date(startDate).toISOString(),
                    endDate: endDate ? new Date(endDate).toISOString() : undefined,
                    name: scheduleName,
                    description,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create schedule')
            }

            toast.success('Lịch ăn uống đã được tạo thành công!')
            onOpenChange(false)

            // Reset form
            setSelectedClientId('')
            setScheduleType('WEEKLY')
            setStartDate(format(new Date(), 'yyyy-MM-dd'))
            setDescription('')

            if (onScheduleCreated) {
                onScheduleCreated()
            }
        } catch (error: any) {
            console.error('Error creating schedule:', error)
            toast.error(error.message || 'Không thể tạo lịch ăn uống')
        } finally {
            setSubmitting(false)
        }
    }

    const preview = calculatePreview()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo Lịch Ăn Uống</DialogTitle>
                    <DialogDescription>
                        Tạo lịch ăn uống định kỳ cho client từ meal plan: <strong>{mealPlan?.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="client">
                            <Users className="w-4 h-4 inline mr-1" />
                            Client <span className="text-red-500">*</span>
                        </Label>
                        <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={loadingClients}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingClients ? 'Đang tải...' : 'Chọn client'} />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        Không có client nào. Hãy thêm client trước.
                                    </div>
                                ) : (
                                    clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name} ({client.email})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Schedule Type */}
                    <div className="space-y-3">
                        <Label>
                            Loại Lịch <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup value={scheduleType} onValueChange={(value) => setScheduleType(value as ScheduleType)}>
                            {SCHEDULE_TYPES.map((type) => {
                                const Icon = type.icon
                                return (
                                    <div
                                        key={type.value}
                                        className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                                        onClick={() => setScheduleType(type.value)}
                                    >
                                        <RadioGroupItem value={type.value} id={type.value} />
                                        <Icon className="w-5 h-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <Label htmlFor={type.value} className="cursor-pointer font-medium">
                                                {type.label}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">{type.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </RadioGroup>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">
                                Ngày Bắt Đầu <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Ngày Kết Thúc</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                            />
                            <p className="text-xs text-muted-foreground">Tự động tính dựa trên loại lịch</p>
                        </div>
                    </div>

                    {/* Schedule Name */}
                    <div className="space-y-2">
                        <Label htmlFor="scheduleName">Tên Lịch</Label>
                        <Input
                            id="scheduleName"
                            value={scheduleName}
                            onChange={(e) => setScheduleName(e.target.value)}
                            placeholder="VD: Lịch giảm cân tuần 1"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Ghi Chú</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Thêm ghi chú cho lịch ăn uống..."
                            rows={3}
                        />
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div className="bg-muted rounded-lg p-4 space-y-2">
                            <p className="font-semibold flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                Xem trước lịch trình
                            </p>

                            <div className="text-sm text-muted-foreground mb-2">
                                Meal Plan này có chu kỳ <strong>{preview.cycleDays} ngày</strong> với <strong>{preview.mealsInCycle} món ăn</strong>.
                                Lịch sẽ tự động lặp lại chu kỳ này trong suốt thời gian đã chọn.
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                                <div>
                                    <p className="text-muted-foreground">Tổng thời gian:</p>
                                    <p className="font-bold text-lg">{preview.duration} ngày</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Tổng số bữa ăn (dự kiến):</p>
                                    <p className="font-bold text-lg text-primary">{preview.totalMeals} bữa</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={submitting || !selectedClientId || !startDate}>
                            {submitting ? 'Đang tạo...' : 'Tạo Lịch'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
