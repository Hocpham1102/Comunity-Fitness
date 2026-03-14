'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'
import { Loader2, CheckCircle2, Copy } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CheckoutDialogProps {
    children: React.ReactNode
    itemsToCheckout?: { id: string; title: string; price: number; currency: string; thumbnailUrl?: string; trainerName?: string }[]
}

export function CheckoutDialog({ children, itemsToCheckout }: CheckoutDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'confirm' | 'payment' | 'success'>('confirm')
    const [loading, setLoading] = useState(false)
    const [orderDetails, setOrderDetails] = useState<{ id: string; amount: number; currency: string } | null>(null)

    const { items: cartItems, totalPrice: cartTotalPrice, clearCart, removeItem } = useCartStore()
    const router = useRouter()

    const checkoutItems = itemsToCheckout || cartItems
    const checkoutTotal = itemsToCheckout
        ? itemsToCheckout.reduce((sum, item) => sum + item.price, 0)
        : cartTotalPrice()

    const handleCreateOrder = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/cart/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: checkoutItems })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setOrderDetails({
                    id: data.orderId,
                    amount: data.totalAmount,
                    currency: data.currency
                })

                // If it was a generic checkout, clear cart. If specific items, remove those specific items.
                if (!itemsToCheckout) {
                    clearCart()
                } else {
                    itemsToCheckout.forEach(item => removeItem(item.id))
                }

                // Free courses are auto-enrolled — skip payment step, go straight to success
                if (data.autoEnrolled) {
                    setStep('success')
                    toast.success('Enrolled successfully! 🎉')
                } else {
                    setStep('payment')
                }
            } else {
                toast.error(data.error || 'Failed to create order. Please try again.')
                if (data.alreadyEnrolledCourseIds) {
                    toast.error('Remove already enrolled courses from cart before proceeding.')
                }
            }
        } catch (error) {
            toast.error('Something went wrong. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    const handlePaymentDone = () => {
        setStep('success')
    }

    const handleClose = () => {
        setOpen(false)
        if (step === 'success') {
            router.push('/my-courses')
            // Reset dialog for future uses
            setTimeout(() => setStep('confirm'), 500)
        }
    }

    // Bank Details
    const BANK_ID = 'TPB' // TPBank
    const ACCOUNT_NO = '00003949954'
    const ACCOUNT_NAME = 'PHAM VAN SY HOC'

    return (
        <Dialog open={open} onOpenChange={(val) => {
            // Don't close if payment info is showing unless clicking done
            if (!val && step === 'payment') {
                toast.info('Please complete or cancel the payment explicitly.')
                return
            }
            if (!val) handleClose()
            else setOpen(val)
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">

                {step === 'confirm' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Confirm Your Order</DialogTitle>
                            <DialogDescription>
                                You are about to purchase {checkoutItems.length} course(s).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="space-y-3 max-h-[40vh] overflow-y-auto mb-4 border rounded-md p-3">
                                {checkoutItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="font-medium line-clamp-1 flex-1 pr-4">{item.title}</span>
                                        <span className="font-semibold whitespace-nowrap">{item.price === 0 ? 'Free' : `${item.price} ${item.currency}`}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total Amount:</span>
                                <span>{checkoutTotal} {checkoutItems[0]?.currency || 'VND'}</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pb-2">
                            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                            <Button onClick={handleCreateOrder} disabled={loading || checkoutItems.length === 0}>
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Create Order & Pay
                            </Button>
                        </div>
                    </>
                )}

                {step === 'payment' && orderDetails && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Payment Instructions</DialogTitle>
                            <DialogDescription>
                                Please transfer the exact amount using the QR code below.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center py-4 space-y-4">
                            {/* VietQR Implementation */}
                            <div className="bg-white p-2 rounded-xl shadow-sm border">
                                <Image
                                    src={`https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${orderDetails.amount}&addInfo=Payment Order ${orderDetails.id}&accountName=${ACCOUNT_NAME}`}
                                    alt="Payment QR Code"
                                    width={250}
                                    height={250}
                                    className="rounded-lg"
                                    unoptimized
                                />
                            </div>

                            <div className="w-full bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-bold text-primary">{orderDetails.amount} {orderDetails.currency}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Transfer Memo:</span>
                                    <span className="font-mono font-medium flex gap-2 items-center">
                                        Payment Order {orderDetails.id.slice(-6).toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="text-center text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 p-3 rounded-md w-full">
                                <strong>Important:</strong> Include the exact transfer memo so your order can be verified quickly.
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pb-2 text-center w-full">
                            <Button variant="outline" className="flex-1" onClick={() => setStep('success')}>I will pay later</Button>
                            <Button className="flex-1" onClick={handlePaymentDone}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                I Have Transferred
                            </Button>
                        </div>
                    </>
                )}

                {step === 'success' && (
                    <div className="py-8 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl">Order Received!</DialogTitle>
                        <p className="text-muted-foreground px-4">
                            We have recorded your order. If you have paid, your courses will be unlocked as soon as the admin verifies the transaction.
                        </p>
                        <Button onClick={handleClose} className="mt-4">
                            Go to My Courses
                        </Button>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    )
}
