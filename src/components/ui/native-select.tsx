import type { ComponentProps } from 'react'
import { cn } from 'cn'
import { ChevronDown } from 'lucide-react'

/** Select nativo estilizado — melhor experiência em celulares. */
export function NativeSelect({
  className,
  wrapperClassName,
  children,
  ...props
}: ComponentProps<'select'> & { wrapperClassName?: string }) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <select
        data-slot="native-select"
        className={cn(
          'h-10 w-full cursor-pointer appearance-none rounded-lg border border-input bg-transparent px-3 pr-9 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
