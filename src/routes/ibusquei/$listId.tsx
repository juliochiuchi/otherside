import { useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ChevronRight,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Store,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import type { ItemFormValues } from '@/components/ibusquei/item-sheet'

import { AppHeader } from '@/components/ibusquei/app-header'
import { ConfirmDialog } from '@/components/ibusquei/confirm-dialog'
import { ItemRow } from '@/components/ibusquei/item-row'
import { ItemSheet } from '@/components/ibusquei/item-sheet'
import { ManageSectorsSheet } from '@/components/ibusquei/manage-sectors-sheet'
import { Progress } from '@/components/ibusquei/progress'
import { SyncStatus } from '@/components/ibusquei/sync-status'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCreateItem,
  useCreateSector,
  useDeleteItem,
  useDeleteList,
  useDeleteSector,
  useFinishRound,
  useRenameList,
  useRenameSector,
  useSnapshot,
  useSyncOnIdle,
  useUpdateItem,
} from '@/lib/ibusquei/hooks'
import { SNAPSHOT_KEY } from '@/lib/ibusquei/keys'
import type { ItemRow as Item, SectorRow, Snapshot } from '@/lib/ibusquei/types'
import {
  getCompletedRoundsCount,
  getListItems,
  getListProgress,
  getListSectors,
  roundQuantity,
  unitStep,
} from '@/lib/ibusquei/utils'
import { asAppRoute } from '@/lib/routes'

export const Route = createFileRoute('/ibusquei/$listId')({
  component: IbusqueiList,
})

function IbusqueiList() {
  const { listId } = Route.useParams()
  useSyncOnIdle()

  const { data: snapshot, isLoading } = useSnapshot()
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()
  const createSector = useCreateSector()
  const renameSector = useRenameSector()
  const deleteSector = useDeleteSector()
  const renameList = useRenameList()
  const deleteList = useDeleteList()
  const finishRound = useFinishRound()

  const list = snapshot?.lists.find((entry) => entry.id === listId) ?? null

  const sectors = useMemo(
    () => getListSectors(snapshot?.sectors ?? [], listId),
    [snapshot?.sectors, listId],
  )
  const items = useMemo(
    () => getListItems(snapshot?.items ?? [], listId),
    [snapshot?.items, listId],
  )
  const progress = useMemo(
    () => getListProgress(snapshot?.items ?? [], listId),
    [snapshot?.items, listId],
  )
  const roundNumber = useMemo(
    () => getCompletedRoundsCount(snapshot?.rounds ?? [], listId) + 1,
    [snapshot?.rounds, listId],
  )

  const itemCountBySector = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      if (item.sector_id) counts[item.sector_id] = (counts[item.sector_id] ?? 0) + 1
    }
    return counts
  }, [items])

  const knownSectorIds = useMemo(() => new Set(sectors.map((sector) => sector.id)), [sectors])
  const orphanItems = useMemo(
    () => items.filter((item) => !item.sector_id || !knownSectorIds.has(item.sector_id)),
    [items, knownSectorIds],
  )

  const [itemSheet, setItemSheet] = useState<{ item: Item | null; sectorId: string | null } | null>(
    null,
  )
  const [sectorsOpen, setSectorsOpen] = useState(false)
  const [finishOpen, setFinishOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)

  const editingItem = itemSheet?.item ?? null

  const openAdd = (sectorId?: string | null) =>
    setItemSheet({ item: null, sectorId: sectorId ?? sectors[0]?.id ?? null })
  const openEdit = (item: Item) => setItemSheet({ item, sectorId: item.sector_id })

  const queryClient = useQueryClient()

  /** Lê a quantidade atual do cache para que toques seguidos não fiquem defasados. */
  const changeQuantity = (item: Item, delta: number) => {
    const current =
      queryClient
        .getQueryData<Snapshot>(SNAPSHOT_KEY)
        ?.items.find((entry) => entry.id === item.id)?.quantity ?? item.quantity
    updateItem.update(item.id, {
      quantity: Math.max(unitStep(item.unit), roundQuantity(current + delta)),
    })
  }

  const submitItem = (values: ItemFormValues) => {
    if (editingItem) {
      updateItem.update(editingItem.id, {
        name: values.name,
        quantity: values.quantity,
        unit: values.unit,
        sector_id: values.sectorId,
      })
    } else {
      createItem.create({
        listId,
        sectorId: values.sectorId,
        name: values.name,
        quantity: values.quantity,
        unit: values.unit,
      })
    }
  }

  if (isLoading && !snapshot) {
    return (
      <div className="min-h-dvh bg-background">
        <AppHeader title="iBusquei" backTo="/ibusquei" actions={<SyncStatus />} />
        <main className="py-4 sm:py-6">
          <PageContainer className="flex max-w-3xl flex-col gap-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </PageContainer>
        </main>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="min-h-dvh bg-background">
        <AppHeader title="iBusquei" backTo="/ibusquei" />
        <main className="py-16">
          <PageContainer className="max-w-3xl text-center">
            <p className="text-sm font-medium">Lista não encontrada</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ela pode ter sido removida em outro dispositivo.
            </p>
            <Button
              variant="outline"
              className="mt-5 cursor-pointer"
              render={<Link to={asAppRoute('/ibusquei')} />}
            >
              Voltar para as listas
            </Button>
          </PageContainer>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader
        title={list.name}
        subtitle={`Rodada ${roundNumber} · ${progress.checked}/${progress.total} no carrinho`}
        backTo="/ibusquei"
        actions={
          <>
            <SyncStatus />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Opções da lista"
                    className="cursor-pointer"
                  />
                }
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => setSectorsOpen(true)} className="cursor-pointer">
                  <Store className="size-4" />
                  Gerenciar setores
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRenameOpen(true)} className="cursor-pointer">
                  <Pencil className="size-4" />
                  Renomear lista
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFinishOpen(true)} className="cursor-pointer">
                  <RefreshCw className="size-4" />
                  Finalizar rodada
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                  className="cursor-pointer"
                >
                  <Trash2 className="size-4" />
                  Excluir lista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <main className="py-4 pb-28 sm:py-6">
        <PageContainer className="flex max-w-3xl flex-col gap-5">
          <section className="animate-rise rounded-xl border border-border/60 bg-card/40 px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Rodada {roundNumber}</p>
                <p className="font-heading text-sm font-medium tabular-nums">
                  {progress.checked} de {progress.total} no carrinho
                </p>
              </div>
              <span className="font-heading text-2xl font-semibold tabular-nums">
                {progress.percent}%
              </span>
            </div>
            <Progress value={progress.percent} className="mt-3" />
          </section>

          {items.length === 0 && sectors.length === 0 ? (
            <div className="animate-rise flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand/10 text-brand">
                <Plus className="size-5" />
              </span>
              <p className="mt-3 text-sm font-medium">Lista vazia</p>
              <p className="mt-1 max-w-xs text-xs text-pretty text-muted-foreground">
                Adicione itens e organize-os por setor para agilizar as compras.
              </p>
              <Button onClick={() => openAdd()} className="mt-5 cursor-pointer">
                <Plus />
                Adicionar item
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {sectors.map((sector) => (
                <SectorSection
                  key={sector.id}
                  sector={sector}
                  items={items.filter((item) => item.sector_id === sector.id)}
                  onAdd={() => openAdd(sector.id)}
                  onToggle={updateItem.toggle}
                  onStep={changeQuantity}
                  onEdit={openEdit}
                />
              ))}

              {orphanItems.length > 0 ? (
                <SectorSection
                  sector={null}
                  items={orphanItems}
                  onAdd={() => openAdd(null)}
                  onToggle={updateItem.toggle}
                  onStep={changeQuantity}
                  onEdit={openEdit}
                />
              ) : null}

              {sectors.length === 0 && orphanItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
                  <p className="text-xs text-muted-foreground">
                    Nenhum item ainda. Use “Adicionar item”.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          <button
            type="button"
            onClick={() => setFinishOpen(true)}
            className="animate-rise flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5 text-left transition-colors hover:bg-muted/60"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
              <RefreshCw className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Finalizar rodada</span>
              <span className="block text-xs text-pretty text-muted-foreground">
                Conclui a rodada atual e começa uma nova com os itens desmarcados.
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PageContainer>
      </main>

      <button
        type="button"
        onClick={() => openAdd()}
        aria-label="Adicionar item"
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-brand pl-4 pr-5 text-sm font-medium text-brand-foreground shadow-lg shadow-black/20 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:right-6 sm:bottom-6"
      >
        <Plus className="size-5" />
        Adicionar item
      </button>

      <ItemSheet
        open={itemSheet !== null}
        onOpenChange={(open) => {
          if (!open) setItemSheet(null)
        }}
        sectors={sectors}
        item={editingItem}
        defaultSectorId={itemSheet?.sectorId ?? null}
        onSubmit={submitItem}
        onDelete={editingItem ? () => deleteItem.remove(editingItem.id) : undefined}
      />

      <ManageSectorsSheet
        open={sectorsOpen}
        onOpenChange={setSectorsOpen}
        sectors={sectors}
        itemCountBySector={itemCountBySector}
        onCreate={(name) => createSector.create(listId, name)}
        onRename={(id, name) => renameSector.rename(id, name)}
        onDelete={(id) => deleteSector.remove(id)}
      />

      <RenameListSheet
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentName={list.name}
        onSave={(name) => renameList.rename(listId, name)}
      />

      <ConfirmDialog
        open={finishOpen}
        onOpenChange={setFinishOpen}
        title="Finalizar rodada?"
        description={`A rodada ${roundNumber} será concluída e uma nova rodada começará com todos os ${progress.total} itens desmarcados.`}
        confirmLabel="Finalizar"
        onConfirm={() => finishRound.finish(listId)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir lista?"
        description={`“${list.name}”, seus setores, itens e o histórico de rodadas serão removidos permanentemente.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={() => deleteList.remove(listId)}
      />
    </div>
  )
}

type SectorSectionProps = {
  sector: SectorRow | null
  items: Item[]
  onAdd: () => void
  onToggle: (item: Item) => void
  onStep: (item: Item, delta: number) => void
  onEdit: (item: Item) => void
}

function SectorSection({
  sector,
  items,
  onAdd,
  onToggle,
  onStep,
  onEdit,
}: SectorSectionProps) {
  return (
    <section className="animate-rise overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-3 py-2">
        <span className="grid size-5 shrink-0 place-items-center rounded-md bg-brand/10 text-brand">
          <Store className="size-3" />
        </span>
        <h2 className="font-heading text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {sector?.name ?? 'Sem setor'}
        </h2>
        <span className="rounded-full border border-border/60 px-1.5 text-[10px] tabular-nums text-muted-foreground">
          {items.length}
        </span>
        <button
          type="button"
          onClick={onAdd}
          aria-label={sector ? `Adicionar item em ${sector.name}` : 'Adicionar item sem setor'}
          className="ml-auto grid size-6 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      <div className="divide-y divide-border/60 px-3">
        {items.length === 0 ? (
          <p className="py-3 text-xs text-muted-foreground">Nenhum item ainda.</p>
        ) : (
          items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggle(item)}
              onStep={(delta) => onStep(item, delta)}
              onEdit={() => onEdit(item)}
            />
          ))
        )}
      </div>
    </section>
  )
}

function RenameListSheet({
  open,
  onOpenChange,
  currentName,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  onSave: (name: string) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <RenameListForm
          currentName={currentName}
          onSave={onSave}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

function RenameListForm({
  currentName,
  onSave,
  onClose,
}: {
  currentName: string
  onSave: (name: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState(currentName)

  const save = () => {
    const value = name.trim()
    if (value && value !== currentName) onSave(value)
    onClose()
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>Renomear lista</SheetTitle>
        <SheetDescription>Escolha um novo nome para esta lista.</SheetDescription>
      </SheetHeader>

      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') save()
        }}
        autoFocus
        className="h-10"
      />

      <SheetFooter>
        <SheetClose render={<Button variant="outline" className="cursor-pointer" />}>
          Cancelar
        </SheetClose>
        <Button disabled={name.trim().length === 0} onClick={save} className="cursor-pointer">
          Salvar
        </Button>
      </SheetFooter>
    </>
  )
}
