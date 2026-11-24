import { CloudOff, Loader2 } from 'lucide-react'

import { usePendingMutations } from '@/lib/ibusquei/hooks'
import { useOnlineStatus } from '@/lib/use-online'
import { cn } from '@/lib/utils'

/**
 * Indicador discreto de sincronização: só aparece quando o app está offline
 * ou quando existem alterações aguardando envio.
 */
export function SyncStatus({ className }: { className?: string }) {
  const online = useOnlineStatus()
  const pending = usePendingMutations()

  if (online && pending === 0) return null

  const offline = !online
  const label = offline
    ? pending > 0
      ? `${pending} para enviar`
      : 'Offline'
    : 'Sincronizando'

  return (
    <span
      title={label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium',
        offline
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
          : 'border-border bg-muted/60 text-muted-foreground',
        className,
      )}
    >
      {offline ? (
        <CloudOff className="size-3.5" />
      ) : (
        <Loader2 className="size-3.5 animate-spin" />
      )}
      <span className="tabular-nums">{label}</span>
    </span>
  )
}
