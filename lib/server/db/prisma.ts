import { PrismaClient } from '@prisma/client'

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Optimized Prisma Client configuration for Neon with auto-suspend handling
export const db =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Enhanced retry logic for Neon auto-suspend with exponential backoff
let isConnecting = false
let connectionAttempts = 0
const MAX_RETRIES = 5
const BASE_RETRY_DELAY = 3000 // 3 seconds

async function connectWithRetry() {
  if (isConnecting) return
  isConnecting = true

  while (connectionAttempts < MAX_RETRIES) {
    try {
      await db.$connect()
      console.log('✅ Database connected successfully')
      connectionAttempts = 0
      isConnecting = false
      return
    } catch (err: any) {
      connectionAttempts++
      const delay = BASE_RETRY_DELAY * Math.pow(1.5, connectionAttempts - 1) // Exponential backoff

      console.warn(
        `⚠️  Database connection attempt ${connectionAttempts}/${MAX_RETRIES} failed:`,
        err.message
      )

      if (connectionAttempts < MAX_RETRIES) {
        console.log(`🔄 Retrying in ${(delay / 1000).toFixed(1)}s... (Neon database may be waking up)`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        console.error('❌ Failed to connect after maximum retries')
        console.log('💡 The database may be suspended. Try refreshing the page in a few seconds.')
        isConnecting = false
        throw err
      }
    }
  }
  isConnecting = false
}

// Don't auto-connect on startup to avoid blocking - let first request trigger connection
// connectWithRetry()

// Graceful shutdown
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

process.on('beforeExit', async () => {
  await db.$disconnect()
})
