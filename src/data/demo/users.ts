/**
 * ДЕМОНСТРАЦИОННЫЕ УЧЁТНЫЕ ЗАПИСИ.
 * Проверка выполняется в браузере и НЕ является защищённой аутентификацией.
 * В рабочей системе её заменяет серверная авторизация (см. docs/02-architecture.md).
 * Персональные данные не хранятся: учётные записи ролевые, без ФИО и контактов (152-ФЗ).
 */
import type { DemoUser } from '@/domain/types'

interface DemoAccount extends DemoUser {
  password: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    login: 'manager',
    password: 'demo',
    displayName: 'Руководитель производства',
    role: 'manager',
    roleLabel: 'Полный доступ',
  },
  {
    login: 'guest',
    password: 'tour',
    displayName: 'Гость экскурсии',
    role: 'guest',
    roleLabel: 'Только 3D-тур',
  },
]

export function verifyDemoCredentials(login: string, password: string): DemoUser | null {
  const account = DEMO_ACCOUNTS.find((a) => a.login === login.trim().toLowerCase() && a.password === password)
  if (!account) return null
  const { password: _omit, ...user } = account
  void _omit
  return user
}
