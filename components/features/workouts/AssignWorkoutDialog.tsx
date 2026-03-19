'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Client {
    id: string
    name: string | null
    email: string
    image: string | null
}

interface AssignWorkoutDialogProps {
    workoutId: string
    workoutName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export default function AssignWorkoutDialog({
    workoutId,
    workoutName,
    open,
    onOpenChange,
    onSuccess,
}: AssignWorkoutDialogProps) {
    const [clients, setClients] = useState<Client[]>([])
    const [assignedClientIds, setAssignedClientIds] = useState<Set<string>>(new Set())
    const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')
    const [notes, setNotes] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)

    // Fetch trainer's clients and current assignments
    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open, workoutId])

    const fetchData = async () => {
        setIsFetching(true)
        try {
            // Fetch trainer's clients
            const clientsRes = await fetch('/api/trainer/clients')
            if (!clientsRes.ok) throw new Error('Failed to fetch clients')
            const clientsData = await clientsRes.json()
            setClients(clientsData.clients || [])

            // Fetch current assignments
            const assignmentsRes = await fetch(`/api/trainer/workouts/${workoutId}/assignments`)
            if (!assignmentsRes.ok) throw new Error('Failed to fetch assignments')
            const assignmentsData = await assignmentsRes.json()
            const assigned = new Set<string>(assignmentsData.assignments.map((a: any) => a.clientId))
            setAssignedClientIds(assigned)
            setSelectedClientIds(new Set<string>(assigned)) // Pre-select already assigned clients
        } catch (error: any) {
            toast.error(error.message || 'Failed to load data')
        } finally {
            setIsFetching(false)
        }
    }

    const handleToggleClient = (clientId: string) => {
        // Don't allow unselecting already assigned clients
        if (assignedClientIds.has(clientId)) {
            return
        }

        const newSelected = new Set(selectedClientIds)
        if (newSelected.has(clientId)) {
            newSelected.delete(clientId)
        } else {
            newSelected.add(clientId)
        }
        setSelectedClientIds(newSelected)
    }

    const handleAssign = async () => {
        // Only assign newly selected clients (not already assigned)
        const newClientIds = Array.from(selectedClientIds).filter(
            (id) => !assignedClientIds.has(id)
        )

        if (newClientIds.length === 0) {
            toast.info('No new clients to assign')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/trainer/workouts/${workoutId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientIds: newClientIds,
                    notes: notes.trim() || undefined,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to assign workout')
            }

            const data = await response.json()
            toast.success(data.message || 'Workout assigned successfully')
            onSuccess()
            onOpenChange(false)

            // Reset state
            setNotes('')
            setSearchQuery('')
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign workout')
        } finally {
            setIsLoading(false)
        }
    }

    // Filter clients by search query
    const filteredClients = clients.filter((client) => {
        const query = searchQuery.toLowerCase()
        return (
            client.name?.toLowerCase().includes(query) ||
            client.email.toLowerCase().includes(query)
        )
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Assign Workout to Clients</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Assign "{workoutName}" to your clients
                    </p>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search clients by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Client List */}
                    <div className="space-y-2">
                        <Label>Select Clients</Label>
                        <ScrollArea className="h-[300px] border rounded-md p-4">
                            {isFetching ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : filteredClients.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    {searchQuery ? 'No clients found' : 'No clients yet'}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredClients.map((client) => {
                                        const isAssigned = assignedClientIds.has(client.id)
                                        const isSelected = selectedClientIds.has(client.id)

                                        return (
                                            <div
                                                key={client.id}
                                                className={`flex items-center space-x-3 p-3 rounded-lg border ${isAssigned
                                                    ? 'bg-muted/50 border-muted-foreground/20'
                                                    : 'hover:bg-accent cursor-pointer'
                                                    }`}
                                                onClick={() => !isAssigned && handleToggleClient(client.id)}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    disabled={isAssigned}
                                                    onCheckedChange={() => handleToggleClient(client.id)}
                                                    className="shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{client.name || 'No name'}</p>
                                                    <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                                                </div>
                                                {isAssigned && (
                                                    <span className="text-xs text-muted-foreground shrink-0">Already assigned</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes for your clients about this workout..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleAssign} disabled={isLoading || selectedClientIds.size === 0}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Assign to {selectedClientIds.size} Client{selectedClientIds.size !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
