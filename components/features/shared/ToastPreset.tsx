import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react'

export type ToastVariant = 'success' | 'info' | 'warning' | 'error'

export function getToastPreset(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return { icon: CheckCircle2, className: 'border-green-500 bg-green-50 text-green-800' }
    case 'info':
      return { icon: Info, className: 'border-blue-500 bg-blue-50 text-blue-800' }
    case 'warning':
      return { icon: AlertTriangle, className: 'border-amber-500 bg-amber-50 text-amber-900' }
    case 'error':
      return { icon: XCircle, className: 'border-red-500 bg-red-50 text-red-800' }
  }
}


