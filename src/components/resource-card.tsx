import type { CSSProperties } from 'react'

import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Clock } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { isComingSoon, type Resource } from '@/config/resources'
import { asAppRoute } from '@/lib/routes'
import { cn } from '@/lib/utils'

type ResourceCardProps = {
  resource: Resource
  accent: string
  style?: CSSProperties
}

export function ResourceCard({ resource, accent, style }: ResourceCardProps) {
  const comingSoon = isComingSoon(resource)
  const Icon = resource.icon

  const card = (
    <Card
      size="sm"
      className="h-full transition-shadow duration-200 group-hover:shadow-lg group-hover:shadow-black/5 group-hover:ring-foreground/25 dark:group-hover:shadow-black/40"
    >
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-lg"
            style={{
              color: accent,
              backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`,
            }}
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-sm leading-snug font-medium">
              {resource.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {resource.description}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {comingSoon && <Clock className="size-3" />}
            {comingSoon
              ? 'Em construção'
              : resource.kind === 'external'
                ? 'Projeto externo'
                : 'Ferramenta interna'}
          </span>
          {!comingSoon && (
            <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (comingSoon) {
    return (
      <div
        aria-disabled="true"
        className="animate-rise h-full cursor-not-allowed opacity-70"
        style={style}
      >
        {card}
      </div>
    )
  }

  const interactive = cn(
    'group animate-rise block h-full cursor-pointer rounded-xl outline-none',
    'transition-transform duration-200 hover:-translate-y-0.5',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  )

  if (resource.kind === 'external') {
    return (
      <a
        href={resource.href}
        target="_blank"
        rel="noopener noreferrer"
        className={interactive}
        style={style}
      >
        {card}
      </a>
    )
  }

  return (
    <Link to={asAppRoute(resource.to)} className={interactive} style={style}>
      {card}
    </Link>
  )
}
