import { User } from '@/lib/services/auth.service'

const ADMIN_EMAIL = 'app.miservicio@gmail.com'

export function isAdmin(user: User | null): boolean {
  if (!user) return false
  return user.role === 'admin' || user.email === ADMIN_EMAIL
}

