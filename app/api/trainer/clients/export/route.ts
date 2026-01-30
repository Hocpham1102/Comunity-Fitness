import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/server/db/prisma'

// POST - Export clients to CSV
export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'TRAINER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { clientIds } = await req.json()

        // Fetch clients with their data
        const clients = await db.trainerClient.findMany({
            where: {
                trainerId: session.user.id,
                ...(clientIds && clientIds.length > 0 ? {
                    clientId: {
                        in: clientIds
                    }
                } : {})
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: {
                startDate: 'desc'
            }
        })

        // Generate CSV content
        const headers = ['Client ID', 'Name', 'Email', 'Status', 'Start Date', 'Last Activity', 'Created At']
        const rows = clients.map((tc: any) => [
            tc.client.id,
            tc.client.name || 'N/A',
            tc.client.email,
            tc.status,
            tc.startDate.toISOString().split('T')[0],
            tc.lastActivity ? tc.lastActivity.toISOString().split('T')[0] : 'N/A',
            tc.client.createdAt.toISOString().split('T')[0]
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
        ].join('\n')

        // Return CSV file
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="clients-export-${new Date().toISOString().split('T')[0]}.csv"`
            }
        })
    } catch (error) {
        console.error('Error exporting clients:', error)
        return NextResponse.json(
            { error: 'Failed to export clients' },
            { status: 500 }
        )
    }
}
