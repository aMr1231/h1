import clsx from 'clsx'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { ArrowRightToLine, Factory, Trash, Truck } from 'lucide-react'
import { Meter, STATUS_ICON, STATUS_TEXT, StageCode } from '@/components/ui/Status'
import { formatNumber, formatPercent, plural } from '@/domain/format'
import { STATUS_META } from '@/domain/status'
import type { StageDefinition, StageParams, StageResult } from '@/domain/types'
import { LAYERS, type TwinLayer } from './layers'

export interface StageNodeData extends Record<string, unknown> {
  def: StageDefinition
  result: StageResult
  params: StageParams
  layer: TwinLayer
  /** Значение слоя относительно максимума по линии (0..1). */
  layerShare: number
  isConstraint: boolean
  isSelected: boolean
  targetPosition: Position
  sourcePosition: Position
  extraSource?: Position
}

export type StageFlowNode = Node<StageNodeData, 'stage'>

const hidden = '!size-1.5 !min-w-0 !border-0 !bg-transparent'

export function StageNode({ data }: NodeProps<StageFlowNode>) {
  const { def, result: s, params, layer, layerShare, isConstraint, isSelected } = data
  const Icon = STATUS_ICON[s.status]
  const layerDef = LAYERS[layer]
  return (
    <div
      className={clsx(
        'w-[212px] cursor-pointer rounded-lg border bg-surface text-left transition-shadow',
        s.status === 'bottleneck' ? 'border-crit/70' : s.status === 'high' ? 'border-warn-mark/70' : 'border-line-strong',
        isSelected ? 'shadow-[0_0_0_3px_var(--color-accent-line),0_8px_20px_rgb(16_24_32/0.12)]' : 'shadow-[0_1px_2px_rgb(16_24_32/0.06)] hover:shadow-[0_4px_14px_rgb(16_24_32/0.10)]',
      )}
      aria-label={`${def.code} ${def.name}. ${STATUS_META[s.status].label}, загрузка ${formatPercent(s.utilization)}`}
    >
      <Handle type="target" position={data.targetPosition} className={hidden} isConnectable={false} />
      <Handle type="source" position={data.sourcePosition} className={hidden} isConnectable={false} />
      {data.extraSource && <Handle type="source" id="scrap" position={data.extraSource} className={hidden} isConnectable={false} />}

      {isConstraint && (
        <div className="flex items-center gap-1 rounded-t-[7px] bg-crit px-2.5 py-0.5 text-2xs font-medium text-white">
          <Icon className="size-3" aria-hidden /> Ограничение линии
        </div>
      )}
      <div className="flex items-start justify-between gap-2 px-3 pt-2.5">
        <div className="min-w-0">
          <StageCode>{def.code}</StageCode>
          <p className="mt-1 truncate text-13 leading-tight font-semibold text-ink">{def.name}</p>
        </div>
        <Icon className={clsx('mt-0.5 size-4 shrink-0', STATUS_TEXT[s.status])} aria-hidden />
      </div>

      <div className="px-3 pt-2 pb-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-2xs text-muted">{layerDef.label}</span>
          <span className="tnum text-[15px] font-semibold text-ink">{layerDef.format(layerDef.value(s))}</span>
        </div>
        <div className="mt-1">
          {layer === 'utilization' ? (
            <Meter value={s.utilization} status={s.status} />
          ) : (
            <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
              <div className="h-full rounded-full bg-data-1" style={{ width: `${Math.max(layerShare * 100, 2)}%` }} />
            </div>
          )}
        </div>
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-2xs">
          <dt className="text-muted">Факт / мощн.</dt>
          <dd className="tnum text-right text-ink-2">
            {formatNumber(s.processedPerHour, 1)} / {formatNumber(s.capacityPerHour, 1)}
          </dd>
          <dt className="text-muted">Операция</dt>
          <dd className="tnum text-right text-ink-2">{formatNumber(s.processMin, 1)} мин</dd>
          <dt className="text-muted">Ресурсы</dt>
          <dd className="tnum truncate text-right text-ink-2" title={`${params.resources} ${plural(params.resources, def.resourceKind)}`}>
            {params.resources} {plural(params.resources, { one: 'ед.', few: 'ед.', many: 'ед.' })}
          </dd>
        </dl>
      </div>
    </div>
  )
}

/* ───────── Терминальные узлы: поставщики, клиенты, брак ───────── */

export interface TerminalNodeData extends Record<string, unknown> {
  kind: 'source' | 'sink' | 'scrap'
  title: string
  value: string
  caption: string
  handle: Position
}

export type TerminalFlowNode = Node<TerminalNodeData, 'terminal'>

const TERMINAL_ICON = { source: ArrowRightToLine, sink: Truck, scrap: Trash }

export function TerminalNode({ data }: NodeProps<TerminalFlowNode>) {
  const Icon = TERMINAL_ICON[data.kind] ?? Factory
  return (
    <div
      className={clsx(
        'w-[168px] rounded-lg border border-dashed px-3 py-2.5',
        data.kind === 'scrap' ? 'border-line-strong bg-subtle' : 'border-[#b9c1ca] bg-[#fbfbfc]',
      )}
    >
      <Handle
        type={data.kind === 'source' ? 'source' : 'target'}
        position={data.handle}
        className={hidden}
        isConnectable={false}
      />
      <div className="flex items-center gap-1.5 text-2xs text-muted">
        <Icon className="size-3.5" aria-hidden />
        {data.title}
      </div>
      <p className="tnum mt-1 text-[15px] font-semibold text-ink">{data.value}</p>
      <p className="text-2xs text-muted">{data.caption}</p>
    </div>
  )
}
