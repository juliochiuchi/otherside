import { supabase } from '@/lib/supabase'

import type { ItemRow, ListRow, RoundRow, SectorRow, Snapshot } from './types'

/**
 * Camada de acesso ao Supabase. Cada função corresponde a uma mutação
 * executada pela fila offline do TanStack Query.
 */

const TABLE = {
  lists: 'ibusquei_lists',
  sectors: 'ibusquei_sectors',
  rounds: 'ibusquei_rounds',
  items: 'ibusquei_items',
} as const

type PostgrestResult<T> = { data: T | null; error: { message: string } | null }

function unwrap<T>(result: PostgrestResult<T>): T {
  if (result.error) throw new Error(result.error.message)
  return result.data as T
}

/** Carrega toda a base do iBusquei em paralelo. */
export async function fetchSnapshot(): Promise<Snapshot> {
  const [lists, sectors, rounds, items] = await Promise.all([
    supabase.from(TABLE.lists).select('*').order('created_at', { ascending: true }),
    supabase.from(TABLE.sectors).select('*').order('position', { ascending: true }),
    supabase.from(TABLE.rounds).select('*').order('started_at', { ascending: false }),
    supabase.from(TABLE.items).select('*').order('position', { ascending: true }),
  ])

  return {
    lists: unwrap<ListRow[]>(lists),
    sectors: unwrap<SectorRow[]>(sectors),
    rounds: unwrap<RoundRow[]>(rounds),
    items: unwrap<ItemRow[]>(items).map((item) => ({
      ...item,
      quantity: Number(item.quantity),
    })),
  }
}

// ---------------------------------------------------------------------------
// Listas
// ---------------------------------------------------------------------------

export type CreateListInput = {
  id: string
  name: string
  roundId: string
  sectors: { id: string; name: string }[]
}

export async function createList(input: CreateListInput) {
  unwrap(
    await supabase.from(TABLE.lists).insert({ id: input.id, name: input.name }),
  )

  if (input.sectors.length > 0) {
    unwrap(
      await supabase.from(TABLE.sectors).insert(
        input.sectors.map((sector, index) => ({
          id: sector.id,
          list_id: input.id,
          name: sector.name,
          position: index,
        })),
      ),
    )
  }

  unwrap(
    await supabase
      .from(TABLE.rounds)
      .insert({ id: input.roundId, list_id: input.id, status: 'active' }),
  )
}

export async function renameList(input: { id: string; name: string }) {
  unwrap(
    await supabase.from(TABLE.lists).update({ name: input.name }).eq('id', input.id),
  )
}

export async function deleteList(input: { id: string }) {
  unwrap(await supabase.from(TABLE.lists).delete().eq('id', input.id))
}

// ---------------------------------------------------------------------------
// Itens
// ---------------------------------------------------------------------------

export type CreateItemInput = {
  id: string
  listId: string
  sectorId: string | null
  name: string
  quantity: number
  unit: string
  position: number
}

export async function createItem(input: CreateItemInput) {
  unwrap(
    await supabase.from(TABLE.items).insert({
      id: input.id,
      list_id: input.listId,
      sector_id: input.sectorId,
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      position: input.position,
    }),
  )
}

export type UpdateItemInput = {
  id: string
  patch: Partial<
    Pick<
      ItemRow,
      'name' | 'quantity' | 'unit' | 'sector_id' | 'is_checked' | 'checked_at' | 'position'
    >
  >
}

export async function updateItem(input: UpdateItemInput) {
  unwrap(
    await supabase.from(TABLE.items).update(input.patch).eq('id', input.id),
  )
}

export async function deleteItem(input: { id: string }) {
  unwrap(await supabase.from(TABLE.items).delete().eq('id', input.id))
}

// ---------------------------------------------------------------------------
// Setores
// ---------------------------------------------------------------------------

export type CreateSectorInput = {
  id: string
  listId: string
  name: string
  position: number
}

export async function createSector(input: CreateSectorInput) {
  unwrap(
    await supabase.from(TABLE.sectors).insert({
      id: input.id,
      list_id: input.listId,
      name: input.name,
      position: input.position,
    }),
  )
}

export async function renameSector(input: { id: string; name: string }) {
  unwrap(
    await supabase.from(TABLE.sectors).update({ name: input.name }).eq('id', input.id),
  )
}

export async function deleteSector(input: { id: string }) {
  unwrap(await supabase.from(TABLE.sectors).delete().eq('id', input.id))
}

// ---------------------------------------------------------------------------
// Rodadas
// ---------------------------------------------------------------------------

/** Conclui a rodada ativa, desmarca os itens e abre uma nova (atômico no banco). */
export async function finishRound(input: { listId: string; newRoundId: string }) {
  const { error } = await supabase.rpc('ibusquei_finish_round', {
    p_list: input.listId,
    p_new_round: input.newRoundId,
  })
  if (error) throw new Error(error.message)
}
