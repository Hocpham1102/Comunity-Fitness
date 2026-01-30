import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = auth?.user?.role === 'ADMIN'
      const isTrainer = auth?.user?.role === 'TRAINER'
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnSettings = nextUrl.pathname.startsWith('/settings')
      const isOnProfile = nextUrl.pathname.startsWith('/profile')
      const isOnWorkouts = nextUrl.pathname.startsWith('/workouts')
      const isOnNutrition = nextUrl.pathname.startsWith('/nutrition')
      const isOnProgress = nextUrl.pathname.startsWith('/progress')
      const isOnTrainerDashboard = nextUrl.pathname.startsWith('/trainer')
      const isOnPublic = nextUrl.pathname.startsWith('/') && !nextUrl.pathname.startsWith('/api')
      const isOnLogin = nextUrl.pathname === '/login'

      // Redirect admins from login to /admin
      if (isOnLogin && isLoggedIn && isAdmin) {
        return Response.redirect(new URL('/admin', nextUrl))
      }

      // Redirect trainers from login to /trainer/dashboard
      if (isOnLogin && isLoggedIn && isTrainer) {
        return Response.redirect(new URL('/trainer/dashboard', nextUrl))
      }

      // Redirect regular users from login to /dashboard
      if (isOnLogin && isLoggedIn && !isAdmin && !isTrainer) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      // Note: Admins can now access both /admin and regular user routes
      // This allows admins to test and use the platform as a regular user would

      // Protected routes that require authentication
      const isProtectedRoute = isOnDashboard || isOnSettings || isOnProfile ||
        isOnWorkouts || isOnNutrition || isOnProgress

      // Allow public routes (including /trainers directory)
      if (isOnPublic && !isProtectedRoute && !isOnAdmin && !isOnTrainerDashboard) {
        return true
      }

      // Protected user routes - trainers should NOT access these
      if (isProtectedRoute) {
        if (!isLoggedIn) return false // Redirect to login

        // Redirect trainers to their dashboard if they try to access user routes
        if (isTrainer) {
          return Response.redirect(new URL('/trainer/dashboard', nextUrl))
        }

        // Allow regular users and admins
        return true
      }

      // Admin routes require admin role
      if (isOnAdmin) {
        if (isLoggedIn && isAdmin) return true
        // Redirect non-admins to dashboard
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
        return false // Redirect to login
      }

      // Trainer routes require trainer or admin role
      if (isOnTrainerDashboard) {
        if (isLoggedIn && (isTrainer || isAdmin)) return true
        // Redirect non-trainers to their appropriate dashboard
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
        return false // Redirect to login
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
