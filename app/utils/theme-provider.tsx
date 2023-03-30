import {useFetcher} from '@remix-run/react'
import * as React from 'react'

const themes = ['light', 'dark'] as const
const prefersLightMQ = '(prefers-color-scheme: light)'
function getPreferredTheme() {
  return window.matchMedia(prefersLightMQ).matches ? 'light' : 'dark'
}

export type Theme = typeof themes[number]
type ThemeContextType = {
  theme: Theme | null
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
)

export function useTheme() {
  const context = React.useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

export function ThemeProvider({
  children,
  ssrTheme,
}: React.PropsWithChildren<{ssrTheme: Theme | null}>) {
  const [theme, setThemeState] = React.useState<Theme | null>(() => {
    if (ssrTheme) {
      if (themes.includes(ssrTheme)) {
        return ssrTheme
      } else {
        return null
      }
    }

    // The only way to reach this point is if the theme session is destroyed,
    // which we never configured. This means, this script should never be
    // reached. The server always sets a theme in the session (see `getTheme()`
    // method on `theme.server.ts`).
    console.warn(
      "Hi there, could you let Gonzalo know you're seeing this message? Thanks!"
    )
    if (typeof window !== 'object') {
      return null
    }
    return getPreferredTheme()
  })

  const themeFetcher = useFetcher()

  function setTheme(theme: Theme) {
    themeFetcher.submit({theme}, {action: 'action/set-theme', method: 'post'})
    setThemeState(theme)
  }

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(prefersLightMQ)
    function handleChange() {
      setThemeState(mediaQuery.matches ? 'light' : 'dark')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <ThemeContext.Provider value={{theme, setTheme}}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * This script is used to prevent a flash of unstyled content (FOUC) when the
 * theme is applied. The server has no way of knowing the user's system
 * preferred theme, so it has to render the page with no theme applied. This
 * script runs on the client and applies the theme as soon as possible.
 */
const clientThemeCode = `
;(() => {
  const theme = window.matchMedia(${JSON.stringify(prefersLightMQ)}).matches
    ? 'light'
    : 'dark';
  const cl = document.documentElement.classList;
  const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
  if (themeAlreadyApplied) {
    // this script shouldn't exist if the theme is already applied!
    console.warn(
      "Hi there, could you let Gonzalo know you're seeing this message? Thanks!",
    );
  } else {
    cl.add(theme);
  }

  // the <dark-mode> and <light-mode> approach won't work for meta tags,
  // so we have to do it manually.
  const meta = document.querySelector('meta[name=color-scheme]');
  if (meta) {
    if (theme === 'dark') {
      meta.content = 'dark light';
    } else if (theme === 'light') {
      meta.content = 'light dark';
    }
  } else {
    console.warn(
      "Hey, could you let Gonzalo know you're seeing this message? Thanks!",
    );
  }
})();
`

export function NonFlashOfThemeScript({ssrTheme}: {ssrTheme: boolean}) {
  const {theme} = useTheme()

  return (
    <>
      {/*
        On the server, "theme" might be `null`, so clientThemeCode ensures that
        this is correct before hydration.
      */}
      <meta
        name="color-scheme"
        content={theme === 'light' ? 'light dark' : 'dark light'}
      />
      {/*
        If we got the theme from the server (from the session), we don't need to run this script
      */}
      {ssrTheme ? null : (
        <script dangerouslySetInnerHTML={{__html: clientThemeCode}} />
      )}
    </>
  )
}

export function isValidTheme(value: unknown): value is Theme {
  return typeof value === 'string' && themes.includes(value as Theme)
}
