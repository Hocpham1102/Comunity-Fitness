'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, UserPlus, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface AssignMealPlanDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    planId: string
    planName: string
    planCycleDays: number
    onSuccess: () => void
}


interface Client {
    id: string
    name: string
    email: string
}

export function AssignMealPlanDialog({
    open,
    onOpenChange,
    planId,
    planName,
    planCycleDays,
    onSuccess,
}: AssignMealPlanDialogProps) {
    const [clients, setClients] = useState<Client[]>([])

    const [selectedClient, setSelectedClient] = useState('')
    const [assignType, setAssignType] = useState<'notify' | 'schedule'>('notify')
    const [scheduleType, setScheduleType] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY')
    const [startDate, setStartDate] = useState<Date>(new Date())
    const [endDate, setEndDate] = useState<Date | undefined>()
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (open) {
            fetchClients()
        }
    }, [open])

    // Auto-calculate end date when start date changes
    useEffect(() => {
        if (startDate && planCycleDays > 0) {
            const calculatedEndDate = new Date(startDate)
            calculatedEndDate.setDate(calculatedEndDate.getDate() + planCycleDays)
            setEndDate(calculatedEndDate)
        }
    }, [startDate, planCycleDays])

    const fetchClients = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/trainer/clients')
            if (response.ok) {
                const data = await response.json()
                const activeClients = data.items.filter(
                    (item: any) => item.status === 'ACTIVE'
                )
                setClients(activeClients.map((item: any) => item.client))
            }
        } catch (error) {
            console.error('Error fetching clients:', error)
            toast.error('Failed to load clients')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedClient) {
            toast.error('Please select a client')
            return
        }

        setIsSubmitting(true)
        try {
            if (assignType === 'notify') {
                // Just assign (create notification)
                const response = await fetch(`/api/trainer/meal-plans/${planId}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clientId: selectedClient }),
                })

                if (!response.ok) {
                    throw new Error('Failed to assign meal plan')
                }

                toast.success('Meal plan assigned successfully')
            } else {
                // Create schedule
                const response = await fetch(`/api/trainer/meal-plans/${planId}/schedule`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientId: selectedClient,
                        scheduleType,
                        startDate: startDate.toISOString(),
                        endDate: endDate?.toISOString(),
                    }),
                })

                if (!response.ok) {
                    throw new Error('Failed to create schedule')
                }

                toast.success('Meal schedule created successfully')
            }

            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            console.error('Error assigning meal plan:', error)
            toast.error(error.message || 'Failed to assign meal plan')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Meal Plan</DialogTitle>
                    <DialogDescription>
                        Assign "{planName}" to a client
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Client Selection */}
                    <div>
                        <Label>Select Client *</Label>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : (
                            <Select value={selectedClient} onValueChange={setSelectedClient}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a client..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name} ({client.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Assignment Type */}
                    <div>
                        <Label>Assignment Type</Label>
                        <RadioGroup value={assignType} onValueChange={(value) => setAssignType(value as 'notify' | 'schedule')}>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                <RadioGroupItem value="notify" id="notify" />
                                <Label htmlFor="notify" className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        <div>
                                            <p className="font-medium">Just Notify</p>
                                            <p className="text-sm text-muted-foreground">
                                                Client receives notification only
                                            </p>
                                        </div>
                                    </div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                <RadioGroupItem value="schedule" id="schedule" />
                                <Label htmlFor="schedule" className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4" />
                                        <div>
                                            <p className="font-medium">Create Schedule</p>
                                            <p className="text-sm text-muted-foreground">
                                                Auto-generate scheduled meals
                                            </p>
                                        </div>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Schedule Options (only shown when creating schedule) */}
                    {assignType === 'schedule' && (
                        <>
                            <div>
                                <Label>Duration</Label>
                                <div className="p-2 border rounded-md bg-muted text-muted-foreground">
                                    {planCycleDays} Days (From Meal Plan)
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>Start Date *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !startDate && 'text-muted-foreground'
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={(date) => date && setStartDate(date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div>
                                    <Label>End Date (Optional)</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !endDate && 'text-muted-foreground'
                                                )}
                                                disabled={true}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                initialFocus
                                                disabled={(date) => date < startDate}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {assignType === 'notify' ? 'Assign' : 'Create Schedule'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
