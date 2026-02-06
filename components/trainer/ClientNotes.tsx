'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface ClientNotesProps {
    clientId: string
    initialNotes?: string
}

export function ClientNotes({ clientId, initialNotes = '' }: ClientNotesProps) {
    const [notes, setNotes] = useState(initialNotes)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Auto-save with debounce
    useEffect(() => {
        if (notes === initialNotes) return // Don't save if unchanged

        const timer = setTimeout(async () => {
            setIsSaving(true)
            try {
                const response = await fetch(`/api/trainer/clients/${clientId}/notes`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notes }),
                })

                if (response.ok) {
                    setLastSaved(new Date())
                }
            } catch (error) {
                console.error('Error saving notes:', error)
            } finally {
                setIsSaving(false)
            }
        }, 1000) // Wait 1 second after typing stops

        return () => clearTimeout(timer)
    }, [notes, clientId, initialNotes])

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Trainer Notes</CardTitle>
                        <CardDescription>
                            Private notes about this client (only you can see)
                        </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {isSaving && (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </span>
                        )}
                        {!isSaving && lastSaved && (
                            <span>Saved at {lastSaved.toLocaleTimeString('en-US')}</span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={8}
                    placeholder="Add notes about this client... (auto-save)"
                    className="resize-none"
                />
            </CardContent>
        </Card>
    )
}
