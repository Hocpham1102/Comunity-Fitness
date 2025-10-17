import 'server-only'
import { cache } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export interface SessionUser {
  id: string
  role: string
  email?: string | null
  name?: string | null
  image?: string | null
}

export const verifySession = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }
  const { id, role, email, name, image } = session.user
  return { isAuth: true, user: { id, role, email, name, image } as SessionUser }
})

export const getSessionOrNull = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  const { id, role, email, name, image } = session.user
  return { isAuth: true, user: { id, role, email, name, image } as SessionUser }
})


