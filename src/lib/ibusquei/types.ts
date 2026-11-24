/**
 * Tipos do iBusquei — espelham as tabelas criadas em `ibusquei.sql`.
 */

export type RoundStatus = 'active' | 'completed'

export type ListRow = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export type SectorRow = {
  id: string
  list_id: string
  name: string
  position: number
  created_at: string
}

export type RoundRow = {
  id: string
  list_id: string
  status: RoundStatus
  started_at: string
  completed_at: string | null
}

export type ItemRow = {
  id: string
  list_id: string
  sector_id: string | null
  name: string
  quantity: number
  unit: string
  is_checked: boolean
  checked_at: string | null
  position: number
  created_at: string
  updated_at: string
}

/** Fotografia completa do domínio — cache local (offline-first). */
export type Snapshot = {
  lists: ListRow[]
  sectors: SectorRow[]
  rounds: RoundRow[]
  items: ItemRow[]
}

export const EMPTY_SNAPSHOT: Snapshot = {
  lists: [],
  sectors: [],
  rounds: [],
  items: [],
}
