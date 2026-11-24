import type { ReactNode } from 'react'

import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { asAppRoute } from '@/lib/routes'
import { cn } from '@/lib/utils'

type AppHeaderProps = {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  actions?: ReactNode
  className?: string
}

/** Cabeçalho fixo das telas de recurso, com navegação de volta. */
export function AppHeader({
  title,
  subtitle,
  backTo,
  backLabel = 'Voltar',
  actions,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-3 sm:px-6">
        {backTo ? (
          <Link
            to={asAppRoute(backTo)}
            aria-label={backLabel}
            className="-ml-1.5 grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-base leading-tight font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        {actions ? <div className="flex items-center gap-1.5">{actions}</div> : null}
      </div>
    </header>
  )
}
