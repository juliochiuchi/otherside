import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Container global de layout: centraliza o conteúdo e cuida dos paddings responsivos. */
export function PageContainer({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}
