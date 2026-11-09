import { STATUS_HEX } from '@/components/ui/Status'
import { ENTERPRISE, STAGES } from '@/data/demo/enterprise'
import { formatDuration, formatNumber, formatPercent, formatRub } from '@/domain/format'
import { STATUS_META } from '@/domain/status'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { BASELINE_RESULT } from '@/hooks/useSimulation'

/* Геометрия мнемосхемы (единицы viewBox). */
const NODE_W = 95
const NODE_H = 76
const GAP = 14
const TOP = 58
const MID = TOP + NODE_H / 2
const VIEW_W = STAGES.length * NODE_W + (STAGES.length - 1) * GAP
const VIEW_H = TOP + NODE_H + 8
const x0 = (i: number) => i * (NODE_W + GAP)

const STEPS: [string, string, string][] = [
  ['01', 'Процесс', 'этапы, ресурсы, параметры'],
  ['02', 'Сценарий', 'нагрузка и изменения'],
  ['03', 'Метрики', 'время, выпуск, загрузка, стоимость'],
  ['04', '3D-тур', 'участки и точки интереса'],
]

/**
 * Правая панель экрана входа: «окно» системы с живой мнемосхемой и показателями базового режима.
 * Все значения берутся из расчёта модели — без нарисованных вручную цифр.
 */
export function LoginShowcase() {
  const reduced = usePrefersReducedMotion()
  const r = BASELINE_RESULT
  const ci = STAGES.findIndex((s) => s.id === r.constraintStageId)
  const constraint = r.stages[ci]
  const constraintDef = STAGES[ci]

  const kpis = [
    { label: 'Выпуск', value: `${formatNumber(r.outputPerDay, 0)} шт/сут` },
    { label: 'Время цикла', value: formatDuration(r.cycleTimeMin) },
    { label: 'Загрузка', value: formatPercent(r.avgUtilization, 1) },
    { label: 'Себестоимость', value: formatRub(r.costPerUnit) },
  ]

  return (
    <div className="relative hidden overflow-hidden bg-graphite text-graphite-ink lg:flex lg:flex-col lg:justify-center lg:p-10 xl:p-14">
      {/* Техническая сетка, растворяющаяся к краям */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.07) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 35%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 35%, transparent 85%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[660px] space-y-10">
        <header>
          <p className="text-2xs tracking-[0.1em] text-accent-bright uppercase">Цифровой двойник · 3D-тур</p>
          <h2 className="mt-3 max-w-[540px] text-[26px] leading-[1.2] font-semibold tracking-[-0.015em] text-white xl:text-[28px]">
            Модель процесса, сценарии изменений и виртуальная экскурсия — в одной системе
          </h2>
          <p className="mt-3 max-w-[520px] text-sm leading-relaxed text-graphite-muted">
            Найдите узкое место, проверьте решение на модели и покажите результат в 3D-туре — на одних и тех же данных.
          </p>
        </header>

        {/* «Окно» системы */}
        <figure className="overflow-hidden rounded-xl border border-white/[0.08] bg-graphite-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
            <span className="flex min-w-0 items-center gap-2 text-xs text-white">
              <span className="size-1.5 shrink-0 rounded-full bg-[#3fb06f]" aria-hidden />
              <span className="truncate">{ENTERPRISE.site}</span>
            </span>
            <span className="shrink-0 font-mono text-2xs text-graphite-muted">модель · базовый режим</span>
          </div>

          <div className="px-5 pt-6 pb-5">
            <svg
              viewBox={`-2 0 ${VIEW_W + 4} ${VIEW_H}`}
              className="w-full overflow-visible"
              role="img"
              aria-label={`Мнемосхема линии: ${STAGES.map((s, i) => `${s.code} ${s.name} ${formatPercent(r.stages[i].utilization)}`).join(', ')}. Узкое место — ${constraintDef.code}.`}
            >
              {/* Связи и движение изделий */}
              {STAGES.slice(0, -1).map((s, i) => {
                const x1 = x0(i) + NODE_W
                const x2 = x0(i + 1)
                return (
                  <g key={`link-${s.id}`}>
                    <line x1={x1} y1={MID} x2={x2 - 1} y2={MID} stroke="#3a4148" strokeWidth={1.5} />
                    <path d={`M${x2 - 6},${MID - 4} L${x2 - 1},${MID} L${x2 - 6},${MID + 4}`} fill="none" stroke="#5a636c" strokeWidth={1.5} />
                    {!reduced &&
                      [0, 0.8].map((delay) => (
                        <circle key={delay} r={1.8} fill="#5fb3c7">
                          <animateMotion dur="1.6s" begin={`${delay + i * 0.27}s`} repeatCount="indefinite" path={`M${x1},${MID} L${x2 - 7},${MID}`} />
                          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="1.6s" begin={`${delay + i * 0.27}s`} repeatCount="indefinite" />
                        </circle>
                      ))}
                  </g>
                )
              })}

              {/* Участки */}
              {STAGES.map((s, i) => {
                const st = r.stages[i]
                const color = STATUS_HEX[st.status]
                const flagged = st.status === 'bottleneck' || st.status === 'high'
                const x = x0(i)
                return (
                  <g key={s.id}>
                    <rect
                      x={x}
                      y={TOP}
                      width={NODE_W}
                      height={NODE_H}
                      rx={7}
                      fill={st.status === 'bottleneck' ? '#2a1f1d' : '#20252a'}
                      stroke={flagged ? color : '#353b42'}
                      strokeWidth={flagged ? 1.4 : 1}
                    />
                    <text x={x + 10} y={TOP + 18} fill="#7d848d" fontSize={9.5} fontFamily="JetBrains Mono Variable, monospace">
                      {s.code}
                    </text>
                    <circle cx={x + NODE_W - 12} cy={TOP + 15} r={3} fill={color}>
                      <title>{STATUS_META[st.status].label}</title>
                    </circle>
                    <text x={x + 10} y={TOP + 38} fill="#eef0f2" fontSize={10.5} fontWeight={500} fontFamily="Inter Variable, sans-serif">
                      {s.shortName}
                    </text>
                    <rect x={x + 10} y={TOP + 56} width={44} height={3} rx={1.5} fill="#353b42" />
                    <rect x={x + 10} y={TOP + 56} width={44 * Math.min(st.utilization, 1)} height={3} rx={1.5} fill={color} />
                    <text x={x + NODE_W - 10} y={TOP + 60} textAnchor="end" fill="#c5cad1" fontSize={10.5} fontFamily="Inter Variable, sans-serif" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatPercent(st.utilization)}
                    </text>
                  </g>
                )
              })}

              {/* Выноска узкого места */}
              <g>
                <line x1={x0(ci) + NODE_W / 2} y1={TOP - 12} x2={x0(ci) + NODE_W / 2} y2={TOP} stroke="#c0432d" strokeWidth={1} />
                <rect x={x0(ci) + NODE_W / 2 - 92} y={TOP - 36} width={184} height={24} rx={12} fill="#3a201c" stroke="#c0432d" strokeOpacity={0.55} />
                <text
                  x={x0(ci) + NODE_W / 2}
                  y={TOP - 20}
                  textAnchor="middle"
                  fill="#f2a597"
                  fontSize={10.5}
                  fontFamily="Inter Variable, sans-serif"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  узкое место · очередь ≈ {formatNumber(constraint.queueLength, 0)} шт
                </text>
              </g>
            </svg>
          </div>

          <dl className="grid grid-cols-4 divide-x divide-white/[0.06] border-t border-white/[0.06]">
            {kpis.map((k) => (
              <div key={k.label} className="min-w-0 px-4 py-3.5 xl:px-5">
                <dt className="truncate text-2xs text-graphite-muted">{k.label}</dt>
                <dd className="mt-1 truncate text-[15px] font-semibold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {k.value}
                </dd>
              </div>
            ))}
          </dl>
        </figure>

        {/* Как это работает: связанный маршрут из четырёх шагов */}
        <ol className="grid grid-cols-4 gap-x-4">
          {STEPS.map(([n, title, desc], i) => (
            <li key={n} className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-[10px] text-white">
                  {n}
                </span>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-white/5" aria-hidden />}
              </div>
              <p className="mt-2.5 text-13 font-medium text-white">{title}</p>
              <p className="mt-0.5 text-xs leading-snug text-graphite-muted">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
