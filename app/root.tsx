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
import ErrorBlock from './components/ErrorBlock'
import MobileNav, {MobileStickyNav} from './components/MobileNav'
import Sidebar from './components/Sidebar'
import ThemeSwitch from './components/ThemeSwitch'
import globalStyles from './styles/global.css'
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

  return (
    <html lang="en" className={theme || ''}>
      <head>
        <Meta />
        <Links />
        <NonFlashOfThemeScript ssrTheme={Boolean(ssrTheme)} />
      </head>
      <body className="p-10">
        <MobileNav />
        <MobileStickyNav />
        <Sidebar />
        <main className="lg:mx-64 mt-10 lg:mt-0">
          <div className="mx-auto lg:max-w-2xl">
            <Outlet />
          </div>
          <div className="hidden lg:block fixed top-10 right-10 left-auto">
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
  const {theme: ssrTheme} = useLoaderData<typeof loader>()

  return (
    <ThemeProvider ssrTheme={ssrTheme}>
      <App />
    </ThemeProvider>
  )
}

type ErrorWrapperProps = {
  title: string
  reason?: any
}

function ErrorWrapper({title, reason}: ErrorWrapperProps) {
  return (
    <html lang="en" className="light">
      <head>
        <Links />
        <title>Oh no... something went wrong!</title>
      </head>
      <body className="p-4">
        <ErrorBlock title={title} reason={reason} />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return (
      <ErrorWrapper
        title="404 - Oh no! You found a broken link :("
        reason={caught.data}
      />
    )
  }

  if (caught.status === 500) {
    return (
      <ErrorWrapper
        title="505 - Oh no! Something did not go well"
        reason={caught.data}
      />
    )
  }

  throw new Error(`Unhandled error: ${caught.status}`)
}

export function ErrorBoundary({error}: {error: unknown}) {
  console.error(error)

  if (error instanceof Error) {
    return (
      <ErrorWrapper
        title="Oh no! Something went wrong :("
        reason={error.message}
      />
    )
  }

  return <ErrorWrapper title="Oh no! Something went wrong :(" />
}
