import type { ItemRow, RoundRow, SectorRow, Snapshot } from './types'

export function newId(): string {
  return crypto.randomUUID()
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function getListSectors(sectors: SectorRow[], listId: string): SectorRow[] {
  return sectors
    .filter((sector) => sector.list_id === listId)
    .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))
}

export function getListItems(items: ItemRow[], listId: string): ItemRow[] {
  return items
    .filter((item) => item.list_id === listId)
    .sort((a, b) => a.position - b.position)
}

export function getActiveRound(rounds: RoundRow[], listId: string): RoundRow | null {
  return rounds.find((round) => round.list_id === listId && round.status === 'active') ?? null
}

export function getCompletedRoundsCount(rounds: RoundRow[], listId: string): number {
  return rounds.filter((round) => round.list_id === listId && round.status === 'completed').length
}

export type ListProgress = {
  total: number
  checked: number
  percent: number
}

export function getListProgress(items: ItemRow[], listId: string): ListProgress {
  const listItems = items.filter((item) => item.list_id === listId)
  const total = listItems.length
  const checked = listItems.filter((item) => item.is_checked).length
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100)
  return { total, checked, percent }
}

/** Agrupa os itens por setor; itens sem setor válido vão para "Sem setor". */
export type SectorGroup = {
  sector: SectorRow | null
  items: ItemRow[]
}

export function groupItemsBySector(
  items: ItemRow[],
  sectors: SectorRow[],
): SectorGroup[] {
  const known = new Set(sectors.map((sector) => sector.id))
  const groups: SectorGroup[] = sectors.map((sector) => ({ sector, items: [] }))

  const orphan: SectorGroup = { sector: null, items: [] }

  for (const item of items) {
    const group = item.sector_id && known.has(item.sector_id)
      ? groups.find((candidate) => candidate.sector?.id === item.sector_id)
      : undefined

    if (group) group.items.push(item)
    else orphan.items.push(item)
  }

  const result = groups.filter((group) => group.items.length > 0)
  if (orphan.items.length > 0) result.push(orphan)
  return result
}

export function nextItemPosition(items: ItemRow[], listId: string): number {
  const listItems = items.filter((item) => item.list_id === listId)
  return listItems.reduce((max, item) => Math.max(max, item.position), -1) + 1
}

export function nextSectorPosition(sectors: SectorRow[], listId: string): number {
  const listSectors = sectors.filter((sector) => sector.list_id === listId)
  return listSectors.reduce((max, sector) => Math.max(max, sector.position), -1) + 1
}

/** Formata a quantidade sem zeros à direita (ex.: 1.50 -> "1.5"). */
export function formatQuantity(quantity: number): string {
  if (!Number.isFinite(quantity)) return '0'
  return String(Number(quantity.toFixed(2)))
}

/** Passo de ajuste da quantidade conforme a unidade. */
export function unitStep(unit: string): number {
  switch (unit) {
    case 'kg':
    case 'L':
      return 0.5
    case 'g':
    case 'ml':
      return 100
    default:
      return 1
  }
}

/** Arredonda a quantidade para duas casas decimais. */
export function roundQuantity(value: number): number {
  return Math.round(value * 100) / 100
}

export function isEmptySnapshot(snapshot: Snapshot | undefined): boolean {
  return !snapshot || snapshot.lists.length === 0
}
