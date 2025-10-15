"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNotify, useConfirm } from '@/providers/notifications-provider'

export default function AlertsDemoPage() {
  const notify = useNotify()
  const confirm = useConfirm()

  const handleSuccess = () =>
    notify.success({ title: 'Saved', description: 'Your changes were saved successfully.' })
  const handleInfo = () =>
    notify.info({ title: 'Heads up', description: 'This is general information.' })
  const handleWarning = () =>
    notify.warning({ title: 'Check this', description: 'Please review the inputs.' })
  const handleError = () =>
    notify.error({ title: 'Failed', description: 'Something went wrong.' })

  const handleConfirm = async () => {
    const ok = await confirm({
      title: 'Delete item?',
      description: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })
    if (ok) notify.success({ title: 'Deleted', description: 'The item was deleted.' })
    else notify.info({ title: 'Cancelled', description: 'No changes were made.' })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Alerts & Toasts Examples</h1>
      <p className="text-sm text-muted-foreground">
        Unified, reusable notifications with typed API. Use these patterns in features to keep UX consistent.
      </p>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSuccess}>Show Success Toast</Button>
            <Button variant="secondary" onClick={handleInfo}>Show Info Toast</Button>
            <Button variant="outline" onClick={handleWarning}>Show Warning Toast</Button>
            <Button variant="destructive" onClick={handleError}>Show Error Toast</Button>
          </div>

          <div className="pt-2">
            <Button variant="destructive" onClick={handleConfirm}>Confirm Destructive Action</Button>
          </div>

          {/* Usage guide (concise) */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{`// Import hooks`}</p>
            <p>{`const notify = useNotify(); const confirm = useConfirm();`}</p>
            <p>{`notify.success({ title: 'Saved', description: 'Done' })`}</p>
            <p>{`const ok = await confirm({ title: 'Delete?', description: 'Cannot undo' })`}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


