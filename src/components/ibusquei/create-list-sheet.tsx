import { useState } from 'react'

import { Check, Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { PRESET_SECTORS } from '@/lib/ibusquei/constants'
import { cn } from '@/lib/utils'

type CreateListSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, sectors: string[]) => void
}

/** Criação de lista: nome + setores iniciais (presets editáveis). */
export function CreateListSheet({ open, onOpenChange, onCreate }: CreateListSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <CreateListForm
          onCreate={onCreate}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

/**
 * Formulário interno. Vive dentro do `SheetContent`, então remonta a cada
 * abertura — o estado sempre começa limpo, sem efeitos de sincronização.
 */
function CreateListForm({
  onCreate,
  onClose,
}: {
  onCreate: (name: string, sectors: string[]) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([...PRESET_SECTORS])
  const [extras, setExtras] = useState<string[]>([])
  const [custom, setCustom] = useState('')

  const togglePreset = (sector: string) => {
    setSelected((current) =>
      current.includes(sector)
        ? current.filter((item) => item !== sector)
        : [...current, sector],
    )
  }

  const addCustom = () => {
    const value = custom.trim()
    if (!value) return
    const exists =
      PRESET_SECTORS.some((sector) => sector.toLowerCase() === value.toLowerCase()) ||
      extras.some((sector) => sector.toLowerCase() === value.toLowerCase())
    if (!exists) setExtras((current) => [...current, value])
    setCustom('')
  }

  const sectors = [
    ...PRESET_SECTORS.filter((sector) => selected.includes(sector)),
    ...extras,
  ]

  const canCreate = name.trim().length > 0

  const submit = () => {
    if (!canCreate) return
    onCreate(name.trim(), sectors)
    onClose()
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>Nova lista</SheetTitle>
        <SheetDescription>
          Dê um nome e escolha os setores. Você pode editar os setores depois.
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="list-name" className="text-xs font-medium text-muted-foreground">
            Nome da lista
          </label>
          <Input
            id="list-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit()
            }}
            placeholder="Ex.: Compras do mês"
            autoFocus
            className="h-10"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Setores</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SECTORS.map((sector) => {
              const active = selected.includes(sector)
              return (
                <button
                  key={sector}
                  type="button"
                  onClick={() => togglePreset(sector)}
                  aria-pressed={active}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
                    active
                      ? 'border-brand/50 bg-brand/10 text-foreground'
                      : 'border-border text-muted-foreground hover:bg-muted',
                  )}
                >
                  {active ? <Check className="size-3" /> : null}
                  {sector}
                </button>
              )
            })}
          </div>
        </div>

        {extras.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {extras.map((sector) => (
              <span
                key={sector}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 py-1 pr-1 pl-2.5 text-xs"
              >
                {sector}
                <button
                  type="button"
                  aria-label={`Remover ${sector}`}
                  onClick={() =>
                    setExtras((current) => current.filter((item) => item !== sector))
                  }
                  className="grid size-5 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex gap-2">
          <Input
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addCustom()
              }
            }}
            placeholder="Adicionar setor..."
            className="h-9"
          />
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={addCustom}
            disabled={custom.trim().length === 0}
            className="cursor-pointer"
          >
            <Plus />
            Adicionar
          </Button>
        </div>
      </div>

      <SheetFooter>
        <SheetClose render={<Button variant="outline" className="cursor-pointer" />}>
          Cancelar
        </SheetClose>
        <Button onClick={submit} disabled={!canCreate} className="cursor-pointer">
          Criar lista
        </Button>
      </SheetFooter>
    </>
  )
}
