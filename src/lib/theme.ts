import { createContext, useContext } from 'react'

/** Tema escolhido pelo usuário. `system` segue a preferência do sistema. */
export type Theme = 'light' | 'dark' | 'system'

export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'otherside:theme'

export type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme deve ser usado dentro de <ThemeProvider>.')
  }

  return context
}

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function getStoredTheme(): Theme {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }

  // O app nasce no escuro; `system` fica disponível como escolha explícita.
  return 'dark'
}
