import { useState } from 'react'

import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { UNITS } from '@/lib/ibusquei/constants'
import type { ItemRow, SectorRow } from '@/lib/ibusquei/types'

export type ItemFormValues = {
  name: string
  quantity: number
  unit: string
  sectorId: string | null
}

type ItemSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectors: SectorRow[]
  /** Item em edição; `null` cria um novo. */
  item?: ItemRow | null
  defaultSectorId?: string | null
  onSubmit: (values: ItemFormValues) => void
  onDelete?: () => void
}

/** Sheet para adicionar ou editar um item (com quantidade e setor). */
export function ItemSheet({
  open,
  onOpenChange,
  sectors,
  item = null,
  defaultSectorId = null,
  onSubmit,
  onDelete,
}: ItemSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <ItemForm
          sectors={sectors}
          item={item}
          defaultSectorId={defaultSectorId}
          onSubmit={onSubmit}
          onDelete={onDelete}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

/** Formulário interno (remonta a cada abertura, estado sempre limpo). */
function ItemForm({
  sectors,
  item,
  defaultSectorId,
  onSubmit,
  onDelete,
  onClose,
}: {
  sectors: SectorRow[]
  item: ItemRow | null
  defaultSectorId: string | null
  onSubmit: (values: ItemFormValues) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [name, setName] = useState(item?.name ?? '')
  const [quantity, setQuantity] = useState(item ? String(item.quantity) : '1')
  const [unit, setUnit] = useState<string>(item?.unit ?? UNITS[0])
  const [sectorId, setSectorId] = useState<string>(item?.sector_id ?? defaultSectorId ?? '')

  const isEditing = item !== null
  const canSubmit = name.trim().length > 0

  const submit = () => {
    if (!canSubmit) return
    const parsed = Number.parseFloat(quantity.replace(',', '.'))
    onSubmit({
      name: name.trim(),
      quantity: Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) / 100 : 1,
      unit,
      sectorId: sectorId || null,
    })
    onClose()
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{isEditing ? 'Editar item' : 'Novo item'}</SheetTitle>
        <SheetDescription>
          Ajuste a quantidade a qualquer momento, durante ou fora das compras.
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="item-name" className="text-xs font-medium text-muted-foreground">
            Item
          </label>
          <Input
            id="item-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit()
            }}
            placeholder="Ex.: Leite integral"
            autoFocus={!isEditing}
            className="h-10"
          />
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="item-quantity"
              className="text-xs font-medium text-muted-foreground"
            >
              Quantidade
            </label>
            <Input
              id="item-quantity"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="item-unit"
              className="text-xs font-medium text-muted-foreground"
            >
              Unidade
            </label>
            <NativeSelect
              id="item-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className="h-10 w-24"
            >
              {UNITS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="item-sector" className="text-xs font-medium text-muted-foreground">
            Setor
          </label>
          <NativeSelect
            id="item-sector"
            value={sectorId}
            onChange={(event) => setSectorId(event.target.value)}
            className="h-10"
          >
            <option value="">Sem setor</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <SheetFooter>
        {isEditing && onDelete ? (
          <Button
            variant="destructive"
            onClick={() => {
              onDelete()
              onClose()
            }}
            className="cursor-pointer sm:mr-auto"
          >
            <Trash2 />
            Remover
          </Button>
        ) : null}
        <SheetClose render={<Button variant="outline" className="cursor-pointer" />}>
          Cancelar
        </SheetClose>
        <Button onClick={submit} disabled={!canSubmit} className="cursor-pointer">
          {isEditing ? 'Salvar' : 'Adicionar'}
        </Button>
      </SheetFooter>
    </>
  )
}
