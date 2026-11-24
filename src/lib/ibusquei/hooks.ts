import { useEffect, useRef } from 'react'

import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as api from './api'
import { mutationKeys, SNAPSHOT_KEY } from './keys'
import type { ItemRow, Snapshot } from './types'
import { newId, nextItemPosition, nextSectorPosition, nowIso } from './utils'

/**
 * Consulta raiz do iBusquei. Todo o domínio vive em um único snapshot em cache,
 * o que mantém a consistência offline e simplifica as atualizações otimistas.
 */
export function useSnapshot() {
  return useQuery({
    queryKey: SNAPSHOT_KEY,
    queryFn: api.fetchSnapshot,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

/** Força a reconciliação com o servidor (botão "Atualizar"). */
export function useRefreshSnapshot() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: SNAPSHOT_KEY })
}

/**
 * Quando a fila de mutações esvazia (a conexão voltou e tudo foi enviado),
 * recarrega o snapshot para refletir o estado do servidor.
 */
export function useSyncOnIdle() {
  const queryClient = useQueryClient()
  const pending = useIsMutating()
  const previous = useRef(pending)

  useEffect(() => {
    const drained = previous.current > 0 && pending === 0
    previous.current = pending
    if (drained && navigator.onLine) {
      queryClient.invalidateQueries({ queryKey: SNAPSHOT_KEY })
    }
  }, [pending, queryClient])
}

/** Quantidade de mutações aguardando conexão (fila offline). */
export function usePendingMutations(): number {
  return useIsMutating()
}

type OptimisticConfig<TInput> = {
  mutationKey: readonly unknown[]
  mutationFn: (input: TInput) => Promise<unknown>
  optimistic: (snapshot: Snapshot, input: TInput) => Snapshot
}

/** Aplica a mudança no cache na hora e desfaz se o envio falhar. */
function useOptimisticMutation<TInput>(config: OptimisticConfig<TInput>) {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, TInput, { previous: Snapshot | undefined }>({
    mutationKey: [...config.mutationKey],
    mutationFn: config.mutationFn,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: SNAPSHOT_KEY })
      const previous = queryClient.getQueryData<Snapshot>(SNAPSHOT_KEY)
      if (previous) {
        queryClient.setQueryData(SNAPSHOT_KEY, config.optimistic(previous, input))
      }
      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SNAPSHOT_KEY, context.previous)
      }
    },
  })
}

// ---------------------------------------------------------------------------
// Listas
// ---------------------------------------------------------------------------

export function useCreateList() {
  const mutation = useOptimisticMutation<api.CreateListInput>({
    mutationKey: mutationKeys.createList,
    mutationFn: api.createList,
    optimistic: (snapshot, input) => {
      const timestamp = nowIso()
      return {
        ...snapshot,
        lists: [
          ...snapshot.lists,
          { id: input.id, name: input.name, created_at: timestamp, updated_at: timestamp },
        ],
        sectors: [
          ...snapshot.sectors,
          ...input.sectors.map((sector, index) => ({
            id: sector.id,
            list_id: input.id,
            name: sector.name,
            position: index,
            created_at: timestamp,
          })),
        ],
        rounds: [
          ...snapshot.rounds,
          {
            id: input.roundId,
            list_id: input.id,
            status: 'active' as const,
            started_at: timestamp,
            completed_at: null,
          },
        ],
      }
    },
  })

  return {
    create: (name: string, sectors: string[]) =>
      mutation.mutate({
        id: newId(),
        name,
        roundId: newId(),
        sectors: sectors.map((sectorName) => ({ id: newId(), name: sectorName })),
      }),
  }
}

export function useRenameList() {
  const mutation = useOptimisticMutation<{ id: string; name: string }>({
    mutationKey: mutationKeys.renameList,
    mutationFn: api.renameList,
    optimistic: (snapshot, input) => ({
      ...snapshot,
      lists: snapshot.lists.map((list) =>
        list.id === input.id ? { ...list, name: input.name, updated_at: nowIso() } : list,
      ),
    }),
  })

  return { rename: (id: string, name: string) => mutation.mutate({ id, name }) }
}

export function useDeleteList() {
  const mutation = useOptimisticMutation<{ id: string }>({
    mutationKey: mutationKeys.deleteList,
    mutationFn: api.deleteList,
    optimistic: (snapshot, input) => ({
      lists: snapshot.lists.filter((list) => list.id !== input.id),
      sectors: snapshot.sectors.filter((sector) => sector.list_id !== input.id),
      rounds: snapshot.rounds.filter((round) => round.list_id !== input.id),
      items: snapshot.items.filter((item) => item.list_id !== input.id),
    }),
  })

  return { remove: (id: string) => mutation.mutate({ id }) }
}

// ---------------------------------------------------------------------------
// Itens
// ---------------------------------------------------------------------------

export function useCreateItem() {
  const queryClient = useQueryClient()
  const mutation = useOptimisticMutation<api.CreateItemInput>({
    mutationKey: mutationKeys.createItem,
    mutationFn: api.createItem,
    optimistic: (snapshot, input) => {
      const timestamp = nowIso()
      return {
        ...snapshot,
        items: [
          ...snapshot.items,
          {
            id: input.id,
            list_id: input.listId,
            sector_id: input.sectorId,
            name: input.name,
            quantity: input.quantity,
            unit: input.unit,
            is_checked: false,
            checked_at: null,
            position: input.position,
            created_at: timestamp,
            updated_at: timestamp,
          },
        ],
      }
    },
  })

  return {
    create: (input: {
      listId: string
      sectorId: string | null
      name: string
      quantity: number
      unit: string
    }) => {
      const snapshot = queryClient.getQueryData<Snapshot>(SNAPSHOT_KEY)
      const position = nextItemPosition(snapshot?.items ?? [], input.listId)
      mutation.mutate({ id: newId(), position, ...input })
    },
  }
}

export function useUpdateItem() {
  const mutation = useOptimisticMutation<api.UpdateItemInput>({
    mutationKey: mutationKeys.updateItem,
    mutationFn: api.updateItem,
    optimistic: (snapshot, input) => ({
      ...snapshot,
      items: snapshot.items.map((item) =>
        item.id === input.id ? { ...item, ...input.patch, updated_at: nowIso() } : item,
      ),
    }),
  })

  return {
    update: (id: string, patch: api.UpdateItemInput['patch']) =>
      mutation.mutate({ id, patch }),
    toggle: (item: ItemRow) =>
      mutation.mutate({
        id: item.id,
        patch: {
          is_checked: !item.is_checked,
          checked_at: item.is_checked ? null : nowIso(),
        },
      }),
  }
}

export function useDeleteItem() {
  const mutation = useOptimisticMutation<{ id: string }>({
    mutationKey: mutationKeys.deleteItem,
    mutationFn: api.deleteItem,
    optimistic: (snapshot, input) => ({
      ...snapshot,
      items: snapshot.items.filter((item) => item.id !== input.id),
    }),
  })

  return { remove: (id: string) => mutation.mutate({ id }) }
}

// ---------------------------------------------------------------------------
// Setores
// ---------------------------------------------------------------------------

export function useCreateSector() {
  const queryClient = useQueryClient()
  const mutation = useOptimisticMutation<api.CreateSectorInput>({
    mutationKey: mutationKeys.createSector,
    mutationFn: api.createSector,
    optimistic: (snapshot, input) => ({
      ...snapshot,
      sectors: [
        ...snapshot.sectors,
        {
          id: input.id,
          list_id: input.listId,
          name: input.name,
          position: input.position,
          created_at: nowIso(),
        },
      ],
    }),
  })

  return {
    create: (listId: string, name: string) => {
      const snapshot = queryClient.getQueryData<Snapshot>(SNAPSHOT_KEY)
      const position = nextSectorPosition(snapshot?.sectors ?? [], listId)
      mutation.mutate({ id: newId(), listId, name, position })
    },
  }
}

export function useRenameSector() {
  const mutation = useOptimisticMutation<{ id: string; name: string }>({
    mutationKey: mutationKeys.renameSector,
    mutationFn: api.renameSector,
    optimistic: (snapshot, input) => ({
      ...snapshot,
      sectors: snapshot.sectors.map((sector) =>
        sector.id === input.id ? { ...sector, name: input.name } : sector,
      ),
    }),
  })

  return { rename: (id: string, name: string) => mutation.mutate({ id, name }) }
}

export function useDeleteSector() {
  const mutation = useOptimisticMutation<{ id: string }>({
    mutationKey: mutationKeys.deleteSector,
    mutationFn: api.deleteSector,
    optimistic: (snapshot, input) => ({
      ...snapshot,
      sectors: snapshot.sectors.filter((sector) => sector.id !== input.id),
      items: snapshot.items.map((item) =>
        item.sector_id === input.id ? { ...item, sector_id: null } : item,
      ),
    }),
  })

  return { remove: (id: string) => mutation.mutate({ id }) }
}

// ---------------------------------------------------------------------------
// Rodadas
// ---------------------------------------------------------------------------

export function useFinishRound() {
  const mutation = useOptimisticMutation<{ listId: string; newRoundId: string }>({
    mutationKey: mutationKeys.finishRound,
    mutationFn: api.finishRound,
    optimistic: (snapshot, input) => {
      const timestamp = nowIso()
      return {
        ...snapshot,
        rounds: [
          ...snapshot.rounds.map((round) =>
            round.list_id === input.listId && round.status === 'active'
              ? { ...round, status: 'completed' as const, completed_at: timestamp }
              : round,
          ),
          {
            id: input.newRoundId,
            list_id: input.listId,
            status: 'active' as const,
            started_at: timestamp,
            completed_at: null,
          },
        ],
        items: snapshot.items.map((item) =>
          item.list_id === input.listId
            ? { ...item, is_checked: false, checked_at: null }
            : item,
        ),
      }
    },
  })

  return { finish: (listId: string) => mutation.mutate({ listId, newRoundId: newId() }) }
}
