import clsx from 'clsx'
import { ArrowDownRight, ArrowUpRight, Calculator, CircleDot, TriangleExclamationPoint } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartLegend, ChartTooltipBox, type RechartsTooltipProps } from '@/components/charts/ChartTooltip'
import { AXIS_TICK, CHART } from '@/components/charts/theme'
import { Button } from '@/components/ui/Button'
import { Delta } from '@/components/ui/Delta'
import { EmptyState } from '@/components/ui/Feedback'
import { LINE_MODEL, STAGES } from '@/data/demo/enterprise'
import { describeChange } from '@/domain/conclusions'
import { formatDateTime, formatNumber, formatPercent } from '@/domain/format'
import { COMPARISON_METRICS, METRICS, compareSummaries } from '@/domain/metrics'
import { summarize } from '@/domain/simulation/engine'
import type { SimulationResult } from '@/domain/types'

export interface Calculation {
  result: SimulationResult
  ranAt: string
  durationMs: number
  /** saved — показан результат сохранённых параметров; run — расчёт запущен пользователем. */
  source: 'saved' | 'run'
}

function formatMs(ms: number) {
  return ms < 0.1 ? '< 0,1 мс' : `${formatNumber(ms, ms < 10 ? 1 : 0)} мс`
}

interface ResultsPanelProps {
  base: SimulationResult
  calculation: Calculation | null
  stale: boolean
  running: boolean
  scenarioName: string
  onRun: () => void
}

const TONE = {
  better: { icon: ArrowUpRight, cls: 'text-ok' },
  worse: { icon: ArrowDownRight, cls: 'text-crit' },
  neutral: { icon: CircleDot, cls: 'text-muted' },
}

export function ResultsPanel({ base, calculation, stale, running, scenarioName, onRun }: ResultsPanelProps) {
  if (!calculation) {
    return (
      <EmptyState
        icon={<Calculator />}
        title="Расчёт ещё не выполнен"
        description="Измените параметры и нажмите «Рассчитать» — модель пересчитает время цикла, выпуск, загрузку и стоимость."
        action={
          <Button variant="primary" onClick={onRun} loading={running} icon={<Calculator />}>
            Рассчитать
          </Button>
        }
      />
    )
  }

  const r = calculation.result
  const deltas = compareSummaries(summarize(base), summarize(r), COMPARISON_METRICS)
  const conclusions = describeChange(LINE_MODEL, base, r)
  const chartData = STAGES.map((def, i) => ({
    code: def.code,
    name: def.shortName,
    base: base.stages[i].utilization,
    scenario: r.stages[i].utilization,
  }))

  return (
    <div className={clsx('space-y-4 transition-opacity', (stale || running) && 'opacity-60')} aria-busy={running}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-13 text-muted">
          <span className="font-medium text-ink-2">База</span> → <span className="font-medium text-ink">{scenarioName}</span>
        </p>
        <p className="tnum text-2xs text-faint">
          {calculation.source === 'saved' ? 'по сохранённым параметрам' : formatDateTime(calculation.ranAt)} · расчёт {formatMs(calculation.durationMs)}
        </p>
      </div>

      {stale && (
        <div className="flex items-start gap-2 rounded-md border border-warn-mark/40 bg-warn-soft px-3 py-2 text-xs text-warn">
          <TriangleExclamationPoint className="mt-px size-3.5 shrink-0" aria-hidden />
          <span className="flex-1">Параметры изменены после расчёта — результаты устарели.</span>
          <Button size="xs" variant="secondary" onClick={onRun} loading={running}>
            Пересчитать
          </Button>
        </div>
      )}

      <section aria-label="Выводы">
        <ul className="space-y-1.5">
          {conclusions.map((c, i) => {
            const t = TONE[c.tone]
            return (
              <li key={i} className="flex gap-2 text-13 text-ink-2">
                <t.icon className={clsx('mt-0.5 size-3.5 shrink-0', t.cls)} aria-hidden />
                <span>{c.text}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-label="Сравнение показателей" className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-13">
          <caption className="sr-only">Базовый сценарий и изменённый сценарий</caption>
          <thead>
            <tr className="bg-subtle text-xs text-muted">
              <th scope="col" className="px-3 py-2 text-left font-medium">Показатель</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">База</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Сценарий</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Изменение</th>
            </tr>
          </thead>
          <tbody>
            {deltas.map((d) => {
              const def = METRICS[d.key]
              return (
                <tr key={d.key} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left text-xs font-normal text-ink-2" title={def.hint}>
                    {def.short}
                  </th>
                  <td className="tnum px-2 py-2 text-right text-xs whitespace-nowrap text-muted">{def.format(d.base)}</td>
                  <td className="tnum px-2 py-2 text-right text-xs font-medium whitespace-nowrap text-ink">{def.format(d.value)}</td>
                  <td className="px-3 py-2 text-right">
                    <Delta delta={d} showShare={false} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="util-compare" className="rounded-lg border border-line p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 id="util-compare" className="text-13 font-semibold text-ink">
            Загрузка участков
          </h3>
          <ChartLegend
            items={[
              { label: 'База', color: CHART.base, shape: 'rect' },
              { label: 'Сценарий', color: CHART.primary, shape: 'rect' },
            ]}
          />
        </div>
        <div className="h-[244px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 0 }} barGap={2} barCategoryGap="22%">
              <CartesianGrid horizontal={false} stroke={CHART.grid} />
              <XAxis
                type="number"
                domain={[0, 1]}
                ticks={[0, 0.25, 0.5, 0.75, 1]}
                tickFormatter={(v: number) => formatPercent(v)}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART.axis }}
              />
              <YAxis type="category" dataKey="code" tick={{ ...AXIS_TICK, fontFamily: 'JetBrains Mono Variable, monospace' }} tickLine={false} axisLine={false} width={40} />
              <ReferenceLine x={0.95} stroke={CHART.crit} strokeDasharray="3 3" strokeWidth={1} />
              <ReferenceLine x={0.85} stroke={CHART.warn} strokeDasharray="3 3" strokeWidth={1} />
              <Tooltip
                cursor={{ fill: 'rgb(16 24 32 / 0.04)' }}
                content={(props) => {
                  const { active, payload } = props as RechartsTooltipProps<(typeof chartData)[number]>
                  const p = payload?.[0]?.payload
                  if (!active || !p) return null
                  return (
                    <ChartTooltipBox
                      title={`${p.code} ${p.name}`}
                      rows={[
                        { key: 'b', label: 'база', value: formatPercent(p.base, 1), color: CHART.base, shape: 'rect' },
                        { key: 's', label: 'сценарий', value: formatPercent(p.scenario, 1), color: CHART.primary, shape: 'rect' },
                      ]}
                    />
                  )
                }}
              />
              <Bar dataKey="base" fill={CHART.base} radius={[0, 3, 3, 0]} maxBarSize={9} isAnimationActive={false} />
              <Bar dataKey="scenario" fill={CHART.primary} radius={[0, 3, 3, 0]} maxBarSize={9} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-2xs text-faint">Пунктир: 85 % — зона риска, 95 % — узкое место.</p>
      </section>
    </div>
  )
}
