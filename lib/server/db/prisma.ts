import { PrismaClient } from '@prisma/client'

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Optimized Prisma Client configuration for Neon
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

// Handle connection errors gracefully
db.$connect().catch((err) => {
  console.error('Failed to connect to database:', err.message)
  console.log('The database may be suspended. It will wake up on the next request.')
})

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
