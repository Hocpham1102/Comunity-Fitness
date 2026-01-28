import { NextResponse } from 'next/server';
import { wakeUpDatabase, isDatabaseConnected } from '@/lib/server/db/health';

export async function GET() {
    try {
        const isConnected = await isDatabaseConnected();

        if (!isConnected) {
            console.log('Database is suspended. Attempting to wake up...');
            const wokenUp = await wakeUpDatabase();

            if (wokenUp) {
                return NextResponse.json({
                    status: 'ok',
                    message: 'Database woken up successfully',
                    wasAsleep: true
                });
            } else {
                return NextResponse.json({
                    status: 'error',
                    message: 'Failed to wake up database'
                }, { status: 503 });
            }
        }

        return NextResponse.json({
            status: 'ok',
            message: 'Database is already connected',
            wasAsleep: false
        });
    } catch (error) {
        console.error('Health check error:', error);
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
