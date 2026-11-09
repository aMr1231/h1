import clsx from 'clsx'
import { ArrowRight, Cuboid, Info, LayoutDashboard, Lock } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { BrandMark, BrandName } from '@/components/layout/Brand'
import { Button } from '@/components/ui/Button'
import { APP } from '@/config/app'
import { ENTERPRISE, STAGES } from '@/data/demo/enterprise'
import { DEMO_ACCOUNTS } from '@/data/demo/users'
import { formatPercent } from '@/domain/format'
import { BASELINE_RESULT } from '@/hooks/useSimulation'
import { STATUS_HEX } from '@/components/ui/Status'
import { homePathFor, useAuthStore } from '@/store/auth'

export default function LoginPage() {
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const loginId = useId()
  const passwordId = useId()
  const errorId = useId()

  if (user) return <Navigate to={homePathFor(user.role)} replace />

  const signIn = (l: string, p: string) => {
    const result = login(l, p)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const target = from && (result.user.role === 'manager' || from.startsWith('/tour')) ? from : homePathFor(result.user.role)
    navigate(target, { replace: true })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    signIn(loginValue, password)
  }

  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[minmax(440px,1fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-8" tone="light" />
          <div>
            <BrandName className="block leading-tight text-ink" />
            <span className="block text-2xs text-muted">{APP.tagline}</span>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-10">
          <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">Вход в систему</h1>
          <p className="mt-1 text-13 text-muted">{ENTERPRISE.name} · {ENTERPRISE.site}</p>

          <form onSubmit={onSubmit} className="mt-7 space-y-3.5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor={loginId} className="text-xs font-medium text-ink-2">
                Логин
              </label>
              <input
                id={loginId}
                autoComplete="username"
                value={loginValue}
                onChange={(e) => {
                  setLoginValue(e.target.value)
                  setError(null)
                }}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={clsx(
                  'h-9 w-full rounded-md border bg-surface px-3 text-13 outline-none focus:border-accent focus:ring-2 focus:ring-accent-line',
                  error ? 'border-crit' : 'border-line-strong',
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={passwordId} className="text-xs font-medium text-ink-2">
                Пароль
              </label>
              <input
                id={passwordId}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={clsx(
                  'h-9 w-full rounded-md border bg-surface px-3 text-13 outline-none focus:border-accent focus:ring-2 focus:ring-accent-line',
                  error ? 'border-crit' : 'border-line-strong',
                )}
              />
            </div>
            {error && (
              <p id={errorId} role="alert" className="text-xs text-crit">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" className="h-9 w-full" icon={<Lock />}>
              Войти
            </Button>
          </form>

          <div className="mt-8">
            <p className="label-caps">Демо-доступ для жюри</p>
            <div className="mt-2 divide-y divide-line rounded-lg border border-line">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.login}
                  type="button"
                  onClick={() => signIn(a.login, a.password)}
                  className="group flex w-full items-center gap-3 px-3 py-2.5 text-left first:rounded-t-lg last:rounded-b-lg hover:bg-subtle"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted group-hover:text-accent">
                    {a.role === 'manager' ? <LayoutDashboard className="size-4" /> : <Cuboid className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-13 font-medium text-ink">{a.displayName}</span>
                    <span className="tnum block text-xs text-muted">
                      {a.roleLabel} · <span className="font-mono">{a.login}</span> / <span className="font-mono">{a.password}</span>
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-2.5 rounded-lg bg-subtle px-3 py-2.5 text-xs text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <p>
              Демонстрационный режим авторизации: проверка выполняется в браузере и не является защищённой
              аутентификацией. Персональные данные не собираются и не передаются (152-ФЗ); сессия хранится только
              в текущей вкладке.
            </p>
          </div>
        </div>
        <p className="text-2xs text-faint">{APP.name} · {APP.version} · данные демонстрационные</p>
      </div>

      <LoginVisual />
    </div>
  )
}

/** Графитовая мнемосхема линии: то же, что увидит пользователь внутри, без декоративных эффектов. */
function LoginVisual() {
  const xs = STAGES.map((_, i) => 60 + i * 96)
  const ci = STAGES.findIndex((s) => s.id === BASELINE_RESULT.constraintStageId)
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-graphite p-12 text-graphite-ink lg:flex">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.09) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />
      <div className="relative">
        <p className="text-2xs tracking-[0.08em] text-graphite-muted uppercase">Цифровой двойник · 3D-тур</p>
        <p className="mt-3 max-w-[460px] text-[22px] leading-snug font-medium text-white">
          Модель процесса, сценарии изменений и виртуальная экскурсия — в одной системе.
        </p>
      </div>

      <svg viewBox="0 0 620 220" className="relative w-full max-w-[640px]" role="img" aria-label="Мнемосхема производственной линии из шести участков">
        {STAGES.map((s, i) => {
          const x = xs[i]
          const r = BASELINE_RESULT.stages[i]
          const color = STATUS_HEX[r.status]
          const flagged = r.status === 'bottleneck' || r.status === 'high'
          return (
            <g key={s.id}>
              {i < STAGES.length - 1 && (
                <>
                  <line x1={x + 34} y1={110} x2={xs[i + 1] - 34} y2={110} stroke="#3a4148" strokeWidth={1.5} />
                  <path d={`M${xs[i + 1] - 40},106 L${xs[i + 1] - 34},110 L${xs[i + 1] - 40},114`} fill="none" stroke="#5a636c" strokeWidth={1.5} />
                </>
              )}
              <rect x={x - 34} y={80} width={68} height={60} rx={5} fill="#1c2024" stroke={flagged ? color : '#3a4148'} strokeWidth={flagged ? 1.6 : 1.2} />
              <text x={x} y={104} textAnchor="middle" fill="#7d848d" fontSize={10} fontFamily="JetBrains Mono Variable, monospace">
                {s.code}
              </text>
              <text x={x} y={123} textAnchor="middle" fill="#e6e9ec" fontSize={10.5} fontFamily="Inter Variable, sans-serif">
                {s.shortName}
              </text>
              <rect x={x - 22} y={150} width={44} height={3} rx={1.5} fill="#2a2f34" />
              <rect x={x - 22} y={150} width={44 * Math.min(r.utilization, 1)} height={3} rx={1.5} fill={color} />
            </g>
          )
        })}
        <text x={xs[ci]} y={62} textAnchor="middle" fill="#e98e7d" fontSize={10} fontFamily="Inter Variable, sans-serif">
          узкое место · {formatPercent(BASELINE_RESULT.constraintUtilization)}
        </text>
        <line x1={xs[ci]} y1={67} x2={xs[ci]} y2={78} stroke="#c0432d" strokeWidth={1} />
      </svg>

      <ol className="relative grid max-w-[560px] grid-cols-4 gap-4 text-xs">
        {[
          ['01', 'Процесс', 'этапы, ресурсы, параметры'],
          ['02', 'Сценарий', 'нагрузка и изменения'],
          ['03', 'Метрики', 'время, выпуск, загрузка, стоимость'],
          ['04', '3D-тур', 'участки и точки интереса'],
        ].map(([n, t, d]) => (
          <li key={n} className="border-t border-white/10 pt-3">
            <span className="font-mono text-2xs text-graphite-muted">{n}</span>
            <p className="mt-1 font-medium text-white">{t}</p>
            <p className="mt-0.5 text-graphite-muted">{d}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
