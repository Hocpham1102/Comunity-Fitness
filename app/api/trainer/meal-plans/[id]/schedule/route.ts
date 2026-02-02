import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createScheduleFromPlan, type CreateScheduleFromPlanInput } from '@/lib/server/services/meal-plan-assignment.service'
import { ScheduleType } from '@prisma/client'

/**
 * POST /api/trainer/meal-plans/[id]/schedule
 * Create a meal schedule from a meal plan
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'TRAINER') {
            return NextResponse.json(
                { error: 'Unauthorized: Trainer access required' },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()

        // Validate required fields
        if (!body.clientId || !body.scheduleType || !body.startDate) {
            return NextResponse.json(
                { error: 'clientId, scheduleType, and startDate are required' },
                { status: 400 }
            )
        }

        const input: CreateScheduleFromPlanInput = {
            planId: id,
            clientId: body.clientId,
            trainerId: session.user.id,
            scheduleType: body.scheduleType as ScheduleType,
            startDate: new Date(body.startDate),
            endDate: body.endDate ? new Date(body.endDate) : undefined,
            name: body.name,
            description: body.description,
        }

        const schedule = await createScheduleFromPlan(input)

        return NextResponse.json(schedule, { status: 201 })
    } catch (error: any) {
        console.error('Error creating schedule from plan:', error)
        if (error.message.includes('not found')) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 })
        }
        return NextResponse.json(
            { error: 'Failed to create schedule from plan' },
            { status: 500 }
        )
    }
}
