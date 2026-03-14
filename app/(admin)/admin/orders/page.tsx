import { redirect } from 'next/navigation'
import { db } from '@/lib/server/db/prisma'
import { auth } from '@/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import { approveOrder, cancelOrder } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/')
    }

    const orders = await db.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
            items: {
                include: {
                    course: { select: { title: true } }
                }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Orders</h1>
            </div>

            <div className="grid gap-6">
                {orders.length === 0 ? (
                    <p className="text-muted-foreground">No orders found.</p>
                ) : (
                    orders.map(order => (
                        <Card key={order.id}>
                            <CardContent className="p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg">Order #{order.id.slice(-6).toUpperCase()}</span>
                                        <Badge variant={order.status === 'COMPLETED' ? 'default' : order.status === 'PENDING' ? 'secondary' : 'destructive'}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Created at {new Date(order.createdAt).toLocaleString()} by <span className="font-semibold text-foreground">{order.user.name || order.user.email}</span>
                                    </p>
                                    <div className="text-sm">
                                        <strong>Items: </strong>
                                        {order.items.map(item => item.course.title).join(', ')}
                                    </div>
                                    <div className="font-semibold mt-2">
                                        Total: <span className="text-primary">{order.totalAmount} {order.currency}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {order.status === 'PENDING' && (
                                        <form action={approveOrder.bind(null, order.id)}>
                                            <Button type="submit" className="gap-2 bg-green-600 hover:bg-green-700">
                                                <Check className="w-4 h-4" /> Approve & Enroll
                                            </Button>
                                        </form>
                                    )}
                                    {order.status === 'PENDING' && (
                                        <form action={cancelOrder.bind(null, order.id)}>
                                            <Button variant="destructive" type="submit" className="gap-2">
                                                <X className="w-4 h-4" /> Cancel
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

