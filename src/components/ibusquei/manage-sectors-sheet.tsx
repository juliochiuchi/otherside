import { useState } from 'react'

import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { SectorRow } from '@/lib/ibusquei/types'

type ManageSectorsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectors: SectorRow[]
  itemCountBySector: Record<string, number>
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

/** Gerencia os setores da lista: adicionar, renomear e remover. */
export function ManageSectorsSheet({
  open,
  onOpenChange,
  sectors,
  itemCountBySector,
  onCreate,
  onRename,
  onDelete,
}: ManageSectorsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SectorsForm
          sectors={sectors}
          itemCountBySector={itemCountBySector}
          onCreate={onCreate}
          onRename={onRename}
          onDelete={onDelete}
        />
      </SheetContent>
    </Sheet>
  )
}

function SectorsForm({
  sectors,
  itemCountBySector,
  onCreate,
  onRename,
  onDelete,
}: {
  sectors: SectorRow[]
  itemCountBySector: Record<string, number>
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}) {
  const [newName, setNewName] = useState('')

  const add = () => {
    const value = newName.trim()
    if (!value) return
    onCreate(value)
    setNewName('')
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>Setores</SheetTitle>
        <SheetDescription>
          Divida a lista por setores do mercado para facilitar as compras.
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        {sectors.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
            Nenhum setor ainda.
          </p>
        ) : (
          sectors.map((sector) => {
            const count = itemCountBySector[sector.id] ?? 0
            return (
              <div key={sector.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    key={`${sector.id}-${sector.name}`}
                    defaultValue={sector.name}
                    onBlur={(event) => {
                      const value = event.target.value.trim()
                      if (value && value !== sector.name) onRename(sector.id, value)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur()
                    }}
                    className="h-9"
                  />
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {count} {count === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover setor ${sector.name}`}
                  onClick={() => onDelete(sector.id)}
                  className="cursor-pointer text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )
          })
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
          placeholder="Novo setor..."
          className="h-9"
        />
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={add}
          disabled={newName.trim().length === 0}
          className="cursor-pointer"
        >
          <Plus />
          Adicionar
        </Button>
      </div>
    </>
  )
}
