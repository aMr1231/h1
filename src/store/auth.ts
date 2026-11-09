import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/config/app'
import { verifyDemoCredentials } from '@/data/demo/users'
import type { DemoUser, Role } from '@/domain/types'

interface AuthState {
  user: DemoUser | null
  login: (login: string, password: string) => { ok: true; user: DemoUser } | { ok: false; error: string }
  logout: () => void
}

/**
 * Демонстрационная авторизация. Сессия хранится только в sessionStorage вкладки
 * и удаляется при закрытии браузера. Не является защищённой аутентификацией.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (login, password) => {
        if (!login.trim() || !password) return { ok: false, error: 'Введите логин и пароль.' }
        const user = verifyDemoCredentials(login, password)
        if (!user) return { ok: false, error: 'Неверный логин или пароль. Используйте демо-учётную запись.' }
        set({ user })
        return { ok: true, user }
      },
      logout: () => set({ user: null }),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ user: s.user }),
    },
  ),
)

export function homePathFor(role: Role): string {
  return role === 'guest' ? '/tour' : '/'
}
