import { Link } from '@tanstack/react-router'
import { Search, Zap } from 'lucide-react'

import { PageContainer } from '@/components/page-container'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function SiteHeader({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <PageContainer className="flex h-14 items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="grid size-7 place-items-center rounded-lg bg-brand text-brand-foreground shadow-sm">
            <Zap className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">
            Otherside
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          {/* No desktop a busca fica só no atalho; no toque, ganha um gatilho visível. */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer sm:hidden"
            onClick={onOpenSearch}
            aria-label="Buscar recursos"
          >
            <Search className="size-4" />
          </Button>
          <ThemeToggle />
        </div>
      </PageContainer>
    </header>
  )
}
