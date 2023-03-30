import type {LoaderArgs} from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from '@remix-run/react'
import globalStyles from '~/styles/global.css'
import Sidebar from './components/Sidebar'
import ThemeSwitch from './components/ThemeSwitch'
import {
  NonFlashOfThemeScript,
  ThemeProvider,
  useTheme,
} from './utils/theme-provider'
import {getThemeSession} from './utils/theme.server'

export function meta() {
  return {
    charset: 'utf-8',
    title: 'Gonzalo Stoll',
    viewport: 'width=device-width,initial-scale=1',
  }
}

export function links() {
  return [{rel: 'stylesheet', href: globalStyles}]
}

export async function loader({request}: LoaderArgs) {
  const themeSession = await getThemeSession(request)
  const theme = themeSession.getTheme()
  return {theme}
}

function App() {
  const {theme: ssrTheme} = useLoaderData<typeof loader>()
  const {theme} = useTheme()
  const computedClassName = `h-full ${theme || ''}`

  return (
    <html lang="en" className={computedClassName}>
      <head>
        <Meta />
        <Links />
        <NonFlashOfThemeScript ssrTheme={Boolean(ssrTheme)} />
      </head>
      <body className="h-full p-10">
        <Sidebar />
        <main className="lg:mx-64">
          <div className="mx-auto max-w-2xl">
            <Outlet />
          </div>
          <div className="fixed top-10 right-10 left-auto">
            <ThemeSwitch />
          </div>
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function AppWithProviders() {
  const {theme} = useLoaderData<typeof loader>()
  return (
    <ThemeProvider ssrTheme={theme}>
      <App />
    </ThemeProvider>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return (
      <html lang="en" className="light">
        <head>
          <Links />
          <title>Not found</title>
        </head>
        <body>
          <h1>
            {caught.status} - {caught.statusText}
          </h1>
          <p>{caught.data}</p>
        </body>
      </html>
    )
  }
}
