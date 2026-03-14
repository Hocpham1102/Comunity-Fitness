'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Package, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface OrderItem {
    id: string
    price: number
    currency: string
    course: {
        title: string
        thumbnailUrl: string | null
        trainer: {
            name: string | null
        }
    }
}

interface Order {
    id: string
    totalAmount: number
    currency: string
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
    createdAt: string
    items: OrderItem[]
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/user/orders')
                if (res.ok) {
                    const data = await res.json()
                    setOrders(data.orders || [])
                }
            } catch (error) {
                console.error('Failed to fetch orders', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>
            case 'PENDING':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
            case 'CANCELLED':
                return <Badge variant="destructive" className="bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-muted rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
                <p className="text-muted-foreground mt-2">Track the status of your course purchases.</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-16 border rounded-xl bg-muted/20 border-dashed">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground mb-6">You haven't purchased any courses yet.</p>
                    <Link href="/courses" className="text-primary hover:underline font-medium">Browse Courses &rarr;</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b pb-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-base font-mono">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <CardDescription className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Total Amount</div>
                                        <div className="text-xl font-bold">{order.totalAmount} {order.currency}</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ul className="divide-y">
                                    {order.items.map((item) => (
                                        <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                                            <div className="relative w-full sm:w-32 h-20 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                                                {item.course.thumbnailUrl ? (
                                                    <Image
                                                        src={item.course.thumbnailUrl}
                                                        alt={item.course.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-medium line-clamp-1">{item.course.title}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        By {item.course.trainer.name || 'Unknown Trainer'}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-medium mt-2">
                                                    {item.price === 0 ? 'Free' : `${item.price} ${item.currency}`}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
