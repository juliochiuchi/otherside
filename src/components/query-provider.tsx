import type { ReactNode } from 'react'

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

import { persister, queryClient } from '@/lib/query-client'

/**
 * Provê o QueryClient e restaura o cache persistido (offline-first).
 * Mutações pausadas (feitas sem conexão) são restauradas e reenviadas
 * automaticamente quando a rede volta.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 30,
        dehydrateOptions: {
          shouldDehydrateMutation: (mutation) => mutation.state.isPaused,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
