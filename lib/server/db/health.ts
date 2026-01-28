import { db } from './prisma';

/**
 * Wake up the Neon database if it's suspended
 * This is useful for development when the database auto-suspends
 */
export async function wakeUpDatabase(): Promise<boolean> {
    try {
        await db.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.error('Database wake-up failed:', error);
        return false;
    }
}

/**
 * Check if database is connected
 */
export async function isDatabaseConnected(): Promise<boolean> {
    try {
        await db.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Retry a database operation with exponential backoff
 * Useful for handling Neon's auto-suspend behavior
 */
export async function retryDatabaseOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Wake up database on first attempt
            if (attempt === 0) {
                await wakeUpDatabase();
            }

            return await operation();
        } catch (error) {
            lastError = error as Error;

            // Check if it's a connection error
            if (error instanceof Error && error.message.includes("Can't reach database server")) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.log(`Database connection failed. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, delay));

                // Try to wake up the database
                await wakeUpDatabase();
            } else {
                // If it's not a connection error, throw immediately
                throw error;
            }
        }
    }

    throw lastError || new Error('Database operation failed after retries');
}
