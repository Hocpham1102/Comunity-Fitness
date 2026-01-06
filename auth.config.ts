import type { NextAuthConfig } from 'next-auth'
import { db } from '@/lib/server/db/prisma'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnTrainer = nextUrl.pathname.startsWith('/trainer')
      const isOnPublic = nextUrl.pathname.startsWith('/') && !nextUrl.pathname.startsWith('/api')

      // Allow public routes
      if (isOnPublic && !isOnDashboard && !isOnAdmin && !isOnTrainer) {
        return true
      }

      // Dashboard routes require authentication
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }

      // Admin routes require admin role
      if (isOnAdmin) {
        if (isLoggedIn && auth?.user?.role === 'ADMIN') return true
        return false // Redirect to dashboard
      }

      // Trainer routes require trainer or admin role
      if (isOnTrainer) {
        if (isLoggedIn && (auth?.user?.role === 'TRAINER' || auth?.user?.role === 'ADMIN')) return true
        return false // Redirect to dashboard
      }

      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub

        // Fetch fresh user data from database to sync name, email, role
        // NOTE: We DON'T sync image here because base64 images are too large for cookies
        // Components will fetch avatar separately via API
        try {
          const user = await db.user.findUnique({
            where: { id: token.sub },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          })

          if (user) {
            session.user.name = user.name
            session.user.email = user.email
            session.user.role = user.role as string
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error)
          // Fallback to token data if database query fails
          session.user.role = token.role as string
        }
      }
      return session
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
  },
  providers: [], // Will be added in auth.ts
} satisfies NextAuthConfig
