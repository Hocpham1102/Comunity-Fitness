"use client"

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import ConfirmDialog from '@/components/features/shared/ConfirmDialog'
import { getToastPreset, type ToastVariant } from '@/components/features/shared/ToastPreset'

type ToastOptions = {
  title?: string
  description?: string
  duration?: number
}

type NotifyAPI = {
  success: (opts: ToastOptions) => void
  info: (opts: ToastOptions) => void
  warning: (opts: ToastOptions) => void
  error: (opts: ToastOptions) => void
}

type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}

const NotifyContext = createContext<NotifyAPI | null>(null)
const ConfirmContext = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    opts: ConfirmOptions
    resolve?: (v: boolean) => void
  }>({ open: false, opts: {} })

  const push = useCallback((variant: ToastVariant, opts: ToastOptions) => {
    const preset = getToastPreset(variant)
    const Icon = preset.icon
    toast({
      title: opts.title,
      description: (
        <div className={`flex items-start gap-2 ${preset.className}`}>
          <Icon className="w-4 h-4 mt-0.5" />
          <span>{opts.description}</span>
        </div>
      ),
      duration: opts.duration ?? 3000,
    })
  }, [])

  const notify = useMemo<NotifyAPI>(() => ({
    success: (o) => push('success', o),
    info: (o) => push('info', o),
    warning: (o) => push('warning', o),
    error: (o) => push('error', o),
  }), [push])

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ open: true, opts, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    confirmState.resolve?.(true)
    setConfirmState({ open: false, opts: {} })
  }, [confirmState])

  const handleCancel = useCallback(() => {
    confirmState.resolve?.(false)
    setConfirmState({ open: false, opts: {} })
  }, [confirmState])

  return (
    <NotifyContext.Provider value={notify}>
      <ConfirmContext.Provider value={confirm}>
        {children}
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.opts.title}
          description={confirmState.opts.description}
          confirmText={confirmState.opts.confirmText}
          cancelText={confirmState.opts.cancelText}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </ConfirmContext.Provider>
    </NotifyContext.Provider>
  )
}

export function useNotify() {
  const ctx = useContext(NotifyContext)
  if (!ctx) throw new Error('useNotify must be used within NotificationsProvider')
  return ctx
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within NotificationsProvider')
  return ctx
}


