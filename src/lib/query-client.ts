import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'

import * as ibusquei from '@/lib/ibusquei/api'
import { mutationKeys } from '@/lib/ibusquei/keys'

/**
 * QueryClient único do app, ajustado para uso offline-first:
 * - consultas continuam servindo o cache quando não há rede;
 * - mutações executam a primeira tentativa mesmo offline e ficam em fila
 *   (pausadas) até a conexão voltar, quando são reenviadas automaticamente.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
  },
})

// Mutações pausadas são persistidas e, ao recarregar o app, precisam de uma
// `mutationFn` para serem retomadas — por isso registramos os defaults por chave.
queryClient.setMutationDefaults(mutationKeys.createList, { mutationFn: ibusquei.createList })
queryClient.setMutationDefaults(mutationKeys.renameList, { mutationFn: ibusquei.renameList })
queryClient.setMutationDefaults(mutationKeys.deleteList, { mutationFn: ibusquei.deleteList })
queryClient.setMutationDefaults(mutationKeys.createItem, { mutationFn: ibusquei.createItem })
queryClient.setMutationDefaults(mutationKeys.updateItem, { mutationFn: ibusquei.updateItem })
queryClient.setMutationDefaults(mutationKeys.deleteItem, { mutationFn: ibusquei.deleteItem })
queryClient.setMutationDefaults(mutationKeys.createSector, { mutationFn: ibusquei.createSector })
queryClient.setMutationDefaults(mutationKeys.renameSector, { mutationFn: ibusquei.renameSector })
queryClient.setMutationDefaults(mutationKeys.deleteSector, { mutationFn: ibusquei.deleteSector })
queryClient.setMutationDefaults(mutationKeys.finishRound, { mutationFn: ibusquei.finishRound })

/** Persiste o cache (consultas + mutações em fila) no localStorage. */
export const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'ibusquei:offline-cache',
  throttleTime: 1000,
})
