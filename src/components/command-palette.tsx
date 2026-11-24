import type { Dispatch, SetStateAction } from 'react'

import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import {
  availableResources,
  resourceCategories,
  type Resource,
} from '@/config/resources'
import { asAppRoute } from '@/lib/routes'

/** Apenas recursos acionáveis entram na busca rápida. */
const groups = resourceCategories
  .map((category) => ({
    ...category,
    items: category.items.filter((resource) =>
      availableResources.includes(resource),
    ),
  }))
  .filter((category) => category.items.length > 0)

type CommandPaletteProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k') return
      if (!event.metaKey && !event.ctrlKey) return

      event.preventDefault()
      onOpenChange((value) => !value)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpenChange])

  const handleSelect = (resource: Resource) => {
    onOpenChange(false)

    if (resource.kind === 'external') {
      window.open(resource.href, '_blank', 'noopener,noreferrer')
      return
    }

    void navigate({ to: asAppRoute(resource.to) })
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Busca rápida"
      description="Encontre ferramentas internas e projetos externos."
    >
      <Command>
        <CommandInput placeholder="Buscar recursos..." />
        <CommandList>
          <CommandEmpty>Nenhum recurso encontrado.</CommandEmpty>
          {groups.map((category) => (
            <CommandGroup key={category.id} heading={category.title}>
              {category.items.map((resource) => {
                const Icon = resource.icon

                return (
                  <CommandItem
                    key={resource.id}
                    value={`${resource.title} ${resource.description} ${(resource.keywords ?? []).join(' ')}`}
                    onSelect={() => handleSelect(resource)}
                    className="cursor-pointer"
                  >
                    <span aria-hidden style={{ color: category.accent }}>
                      <Icon className="size-4" />
                    </span>
                    <span className="truncate">{resource.title}</span>
                    <CommandShortcut>
                      {resource.kind === 'external' ? 'Externo' : 'Interno'}
                    </CommandShortcut>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
