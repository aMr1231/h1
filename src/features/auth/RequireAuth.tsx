import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import type { Role } from '@/domain/types'
import { homePathFor, useAuthStore } from '@/store/auth'

interface RequireAuthProps {
  children: ReactNode
  roles?: Role[]
}

/** Защищённый маршрут: без сессии — на вход; без нужной роли — на домашний раздел роли. */
export function RequireAuth({ children, roles }: RequireAuthProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />
  }
  return <>{children}</>
}
