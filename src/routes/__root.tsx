import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'

import { QueryProvider } from '@/components/query-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <TooltipProvider>
          <Outlet />
          <TanStackRouterDevtools />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
