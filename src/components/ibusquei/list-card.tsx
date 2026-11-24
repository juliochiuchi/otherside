import { Link } from '@tanstack/react-router'
import { ChevronRight, Repeat } from 'lucide-react'

import { Progress } from '@/components/ibusquei/progress'
import { Card, CardContent } from '@/components/ui/card'
import { asAppRoute } from '@/lib/routes'
import type { ListRow } from '@/lib/ibusquei/types'
import type { ListProgress } from '@/lib/ibusquei/utils'

type ListCardProps = {
  list: ListRow
  progress: ListProgress
  roundNumber: number
}

/** Cartão de uma lista de compras no índice do iBusquei. */
export function ListCard({ list, progress, roundNumber }: ListCardProps) {
  return (
    <Link
      to={asAppRoute(`/ibusquei/${list.id}`)}
      className="animate-rise group block cursor-pointer rounded-xl outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        size="sm"
        className="h-full transition-shadow duration-200 group-hover:shadow-lg group-hover:shadow-black/5 group-hover:ring-foreground/25 dark:group-hover:shadow-black/40"
      >
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-heading text-sm leading-snug font-medium">
                {list.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Repeat className="size-3" />
                Rodada {roundNumber}
                <span aria-hidden>·</span>
                {progress.total} {progress.total === 1 ? 'item' : 'itens'}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>

          <Progress value={progress.percent} />

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              {progress.checked} de {progress.total} no carrinho
            </span>
            <span className="tabular-nums font-medium text-foreground">
              {progress.percent}%
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
