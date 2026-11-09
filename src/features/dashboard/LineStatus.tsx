import clsx from 'clsx'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { Meter, STATUS_ICON, STATUS_TEXT, StageCode } from '@/components/ui/Status'
import { STAGES, getStage } from '@/data/demo/enterprise'
import { formatDuration, formatNumber, formatPercent } from '@/domain/format'
import { lineHealth } from '@/domain/insights'
import { STATUS_META } from '@/domain/status'
import type { SimulationResult } from '@/domain/types'

/** Состояние линии: вывод одной фразой + мнемо-полоса из шести участков (клик → двойник). */
export function LineStatus({ result }: { result: SimulationResult }) {
  const health = lineHealth(result)
  const Icon = STATUS_ICON[health.tone]
  const constraint = result.stages.find((s) => s.stageId === result.constraintStageId)!
  const constraintDef = getStage(constraint.stageId)!

  return (
    <section aria-labelledby="line-status-title" className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Icon className={clsx('mt-0.5 size-5 shrink-0', STATUS_TEXT[health.tone])} aria-hidden />
          <div className="min-w-0">
            <h2 id="line-status-title" className="text-[15px] font-semibold text-ink">
              {health.title}
            </h2>
            <p className="mt-0.5 text-13 text-muted">
              Ограничение линии — <span className="font-medium text-ink-2">{constraintDef.code} {constraintDef.name}</span>:
              загрузка {formatPercent(constraint.utilization)}, очередь ≈ {formatNumber(constraint.queueLength, 0)} шт,
              ожидание {formatDuration(constraint.waitMin)}.
            </p>
          </div>
        </div>
        <dl className="flex shrink-0 gap-6 pl-8 text-13 lg:pl-0">
          <div>
            <dt className="text-xs text-muted">План суток</dt>
            <dd className="tnum font-medium text-ink">
              {formatNumber(result.outputPerDay, 0)} / {formatNumber(result.plannedOutputPerDay, 0)} шт
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Выполнение</dt>
            <dd className={clsx('tnum font-medium', result.planAttainment < 0.995 ? 'text-crit' : 'text-ink')}>
              {formatPercent(result.planAttainment, 1)}
            </dd>
          </div>
        </dl>
      </div>

      <ol className="scrollbar-thin flex overflow-x-auto" aria-label="Участки линии по ходу процесса">
        {STAGES.map((def, i) => {
          const s = result.stages[i]
          const SIcon = STATUS_ICON[s.status]
          return (
            <li key={def.id} className="relative min-w-[150px] flex-1 border-r border-line last:border-r-0">
              <Link
                to={`/twin?stage=${def.id}`}
                className="group flex h-full flex-col gap-2 px-3.5 py-3 transition-colors hover:bg-subtle"
                aria-label={`${def.code} ${def.name}: ${STATUS_META[s.status].label}, загрузка ${formatPercent(s.utilization)}. Открыть на схеме`}
              >
                <div className="flex items-center justify-between gap-2">
                  <StageCode>{def.code}</StageCode>
                  <SIcon className={clsx('size-3.5', STATUS_TEXT[s.status])} aria-hidden />
                </div>
                <p className="truncate text-13 font-medium text-ink">{def.shortName}</p>
                <div className="mt-auto space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted">{STATUS_META[s.status].short}</span>
                    <span className="tnum font-medium text-ink-2">{formatPercent(s.utilization)}</span>
                  </div>
                  <Meter value={s.utilization} status={s.status} />
                </div>
              </Link>
              {i < STAGES.length - 1 && (
                <span className="absolute top-1/2 -right-[7px] z-10 flex size-3.5 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-faint" aria-hidden>
                  <ChevronRight className="size-2.5" />
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
