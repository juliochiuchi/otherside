import { createFileRoute } from '@tanstack/react-router'
import { Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'

import { CommandPalette } from '@/components/command-palette'
import { PageContainer } from '@/components/page-container'
import { ResourceCard } from '@/components/resource-card'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { allResources, searchResources } from '@/config/resources'

export const Route = createFileRoute('/')({
  component: HomeHub,
})

function HomeHub() {
  const [query, setQuery] = useState('')
  const [paletteOpen, setPaletteOpen] = useState(false)

  const categories = useMemo(() => searchResources(query), [query])
  const hasResults = categories.length > 0

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader onOpenSearch={() => setPaletteOpen(true)} />

      <main className="py-6 sm:py-10">
        <PageContainer className="flex flex-col gap-8 sm:gap-12">
          <section className="animate-rise relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 px-5 py-8 sm:px-8 sm:py-10">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 left-1/2 size-[440px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand)_40%,transparent),transparent_70%)] blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
            </div>

            <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="size-3" />
                Hub de recursos
              </span>

              <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Tudo o que você precisa, em um só lugar.
              </h1>

              <p className="mt-2 max-w-md text-sm text-pretty text-muted-foreground">
                Escolha um recurso para começar. Ferramentas internas e projetos
                externos reunidos em um único ponto de partida.
              </p>

              <div className="relative mt-6 w-full max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar recursos..."
                  aria-label="Buscar recursos"
                  className="h-10 pl-9"
                />
              </div>

              <p className="mt-3 hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                Busca rápida com
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium">
                  ⌘/Ctrl
                </kbd>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium">
                  K
                </kbd>
              </p>
            </div>
          </section>

          {hasResults ? (
            <div className="flex flex-col gap-8 sm:gap-10">
              {categories.map((category, index) => {
                const CategoryIcon = category.icon

                return (
                  <section
                    key={category.id}
                    className="animate-rise"
                    style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        aria-hidden
                        className="grid size-8 shrink-0 place-items-center rounded-lg"
                        style={{
                          color: category.accent,
                          backgroundColor: `color-mix(in oklab, ${category.accent} 14%, transparent)`,
                        }}
                      >
                        <CategoryIcon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-heading text-sm font-semibold tracking-tight">
                          {category.title}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <span className="ml-auto rounded-full border border-border/60 px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                        {category.items.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {category.items.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          accent={category.accent}
                        />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="animate-rise flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <Search className="size-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                Nenhum recurso encontrado
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Nada corresponde a “{query}”.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 cursor-pointer"
                onClick={() => setQuery('')}
              >
                Limpar busca
              </Button>
            </div>
          )}
        </PageContainer>
      </main>

      <footer className="border-t border-border/60 py-6">
        <PageContainer className="flex flex-col items-center justify-between gap-2 text-[11px] text-muted-foreground sm:flex-row">
          <span>Otherside · hub de recursos</span>
          <span className="tabular-nums">
            {allResources.length} recursos catalogados
          </span>
        </PageContainer>
      </footer>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
