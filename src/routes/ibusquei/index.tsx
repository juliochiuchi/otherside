import { createFileRoute } from '@tanstack/react-router'
import { Plus, ShoppingCart } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AppHeader } from '@/components/ibusquei/app-header'
import { CreateListSheet } from '@/components/ibusquei/create-list-sheet'
import { ListCard } from '@/components/ibusquei/list-card'
import { SyncStatus } from '@/components/ibusquei/sync-status'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCreateList,
  useSnapshot,
  useSyncOnIdle,
} from '@/lib/ibusquei/hooks'
import { getCompletedRoundsCount, getListProgress } from '@/lib/ibusquei/utils'

export const Route = createFileRoute('/ibusquei/')({
  component: IbusqueiLists,
})

function IbusqueiLists() {
  useSyncOnIdle()
  const { data: snapshot, isLoading } = useSnapshot()
  const createList = useCreateList()
  const [createOpen, setCreateOpen] = useState(false)

  const lists = useMemo(
    () => [...(snapshot?.lists ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [snapshot?.lists],
  )

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader
        title="iBusquei"
        subtitle="Listas de compras"
        backTo="/"
        actions={<SyncStatus />}
      />

      <main className="py-4 pb-28 sm:py-6">
        <PageContainer className="max-w-3xl">
          {isLoading && !snapshot ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : lists.length === 0 ? (
            <EmptyState onCreate={() => setCreateOpen(true)} />
          ) : (
            <div className="flex flex-col gap-3">
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  progress={getListProgress(snapshot?.items ?? [], list.id)}
                  roundNumber={getCompletedRoundsCount(snapshot?.rounds ?? [], list.id) + 1}
                />
              ))}
            </div>
          )}
        </PageContainer>
      </main>

      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        aria-label="Nova lista"
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-brand pl-4 pr-5 text-sm font-medium text-brand-foreground shadow-lg shadow-black/20 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:right-6 sm:bottom-6"
      >
        <Plus className="size-5" />
        Nova lista
      </button>

      <CreateListSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(name, sectors) => createList.create(name, sectors)}
      />
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="animate-rise flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
        <ShoppingCart className="size-6" />
      </span>
      <h2 className="mt-4 font-heading text-sm font-semibold tracking-tight">
        Nenhuma lista ainda
      </h2>
      <p className="mt-1 max-w-xs text-xs text-pretty text-muted-foreground">
        Crie sua primeira lista, divida por setores do mercado e reutilize a cada
        nova rodada de compras.
      </p>
      <Button onClick={onCreate} className="mt-5 cursor-pointer">
        <Plus />
        Criar lista
      </Button>
    </div>
  )
}
