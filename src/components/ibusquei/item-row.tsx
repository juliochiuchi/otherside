import { Check, Minus, Plus } from 'lucide-react'

import type { ItemRow as Item } from '@/lib/ibusquei/types'
import { formatQuantity, unitStep } from '@/lib/ibusquei/utils'
import { cn } from '@/lib/utils'

type ItemRowProps = {
  item: Item
  onToggle: () => void
  /** Ajuste incremental da quantidade (positivo ou negativo). */
  onStep: (delta: number) => void
  onEdit: () => void
}

/** Linha de um item: check, nome e ajuste de quantidade. */
export function ItemRow({ item, onToggle, onStep, onEdit }: ItemRowProps) {
  const step = unitStep(item.unit)

  return (
    <div className="flex items-center gap-2.5 py-2.5">
      <button
        type="button"
        onClick={onToggle}
        role="checkbox"
        aria-checked={item.is_checked}
        aria-label={item.is_checked ? `Desmarcar ${item.name}` : `Marcar ${item.name}`}
        className={cn(
          'grid size-6 shrink-0 cursor-pointer place-items-center rounded-full border transition-colors',
          item.is_checked
            ? 'border-brand bg-brand text-brand-foreground'
            : 'border-border bg-background hover:border-brand/60',
        )}
      >
        {item.is_checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </button>

      <button type="button" onClick={onEdit} className="min-w-0 flex-1 cursor-pointer text-left">
        <span
          className={cn(
            'block truncate text-sm transition-colors',
            item.is_checked && 'text-muted-foreground line-through',
          )}
        >
          {item.name}
        </span>
      </button>

      <div className="flex shrink-0 items-center rounded-full border border-border bg-background">
        <button
          type="button"
          onClick={() => onStep(-step)}
          aria-label={`Diminuir quantidade de ${item.name}`}
          className="grid size-6 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Minus className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar quantidade de ${item.name}`}
          className="min-w-11 cursor-pointer px-0.5 text-center text-xs tabular-nums"
        >
          {formatQuantity(item.quantity)}
          <span className="ml-0.5 text-muted-foreground">{item.unit}</span>
        </button>

        <button
          type="button"
          onClick={() => onStep(step)}
          aria-label={`Aumentar quantidade de ${item.name}`}
          className="grid size-6 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
