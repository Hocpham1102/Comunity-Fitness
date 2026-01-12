import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnSettings = nextUrl.pathname.startsWith('/settings')
      const isOnProfile = nextUrl.pathname.startsWith('/profile')
      const isOnWorkouts = nextUrl.pathname.startsWith('/workouts')
      const isOnNutrition = nextUrl.pathname.startsWith('/nutrition')
      const isOnProgress = nextUrl.pathname.startsWith('/progress')
      const isOnTrainer = nextUrl.pathname === '/trainer' || nextUrl.pathname.startsWith('/trainer/')
      const isOnPublic = nextUrl.pathname.startsWith('/') && !nextUrl.pathname.startsWith('/api')

      // Protected routes that require authentication
      const isProtectedRoute = isOnDashboard || isOnSettings || isOnProfile ||
        isOnWorkouts || isOnNutrition || isOnProgress

      // Allow public routes (including /trainers directory)
      if (isOnPublic && !isProtectedRoute && !isOnAdmin && !isOnTrainer) {
        return true
      }

      // Protected routes require authentication
      if (isProtectedRoute) {
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
        // Sync user data from JWT token (populated during login)
        session.user.name = token.name as string | null
        session.user.email = token.email as string
        session.user.role = token.role as string
      }
      return session
    },
    jwt({ token, user }) {
      if (user) {
        // Store user data in JWT token during login
        token.role = (user as any).role
        token.name = user.name
        token.email = user.email
      }
      return token
    },
  },
  providers: [], // Will be added in auth.ts
} satisfies NextAuthConfig
