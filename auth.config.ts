import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    signUp: '/register',
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
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.role = token.role as string
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
