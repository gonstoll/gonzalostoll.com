import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useRouteError,
} from '@remix-run/react'
import type {LoaderArgs} from '@vercel/remix'
import {json} from '@vercel/remix'
import * as React from 'react'
import ErrorBlock from './components/ErrorBlock'
import MobileNav from './components/MobileNav'
import Sidebar from './components/Sidebar'
import ThemeSwitch from './components/ThemeSwitch'
import globalStyles from './styles/global.css'
import {
  NonFlashOfThemeScript,
  ThemeProvider,
  useTheme,
} from './utils/theme-provider'
import {getThemeSession} from './utils/theme.server'

function useWindowWidth() {
  const [windowWidth, setWindowWidth] = React.useState(0)

  React.useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth)
    }

    // Call handler right away so state gets updated with initial window size
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {windowWidth}
}

export function meta() {
  return [
    {title: 'Gonzalo Stoll'},
    {
      name: 'description',
      content:
        'Gonzalo Stoll is a software engineer and a web developer based in Copenhagen. He is currently working at Workday. He also enjoys writting and mentoring.',
    },
    {keywords: 'gonzalo, stoll, gonzalo stoll'},
    {property: 'og:title', content: 'Gonzalo Stoll'},
    {
      property: 'og:description',
      content:
        'Gonzalo Stoll is a software engineer and a web developer based in Copenhagen. He is currently working at Workday. He also enjoys writting and mentoring.',
    },
    {
      property: 'og:image',
      content: 'https://gonzalostoll.com/images/profile.png',
    },
    {property: 'og:url', content: 'https://gonzalostoll.com'},
  ]
}

export function links() {
  return [
    {rel: 'stylesheet', href: globalStyles},
    {
      rel: 'preload',
      href: '/fonts/scto/regular.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: '/fonts/scto/bold.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/favicons/apple-touch-icon-180x180.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicons/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicons/favicon-16x16.png',
    },
    {rel: 'manifest', href: '/site.webmanifest'},
    {rel: 'icon', href: '/favicons/favicon.ico'},
  ]
}

export async function loader({request}: LoaderArgs) {
  const themeSession = await getThemeSession(request)
  const theme = themeSession.getTheme()
  return json({theme})
}

function App() {
  const {theme: ssrTheme} = useLoaderData<typeof loader>()
  const {theme} = useTheme()
  const {windowWidth} = useWindowWidth()
  const isMobileLayout = windowWidth < 1024

  return (
    <html lang="en" className={theme || ''}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="author" content="Gonzalo Stoll" />
        <meta
          name="theme-color"
          content={theme === 'dark' ? '#1c1c27' : '#fbf9f9'}
        />
        <Meta />
        <Links />
        <NonFlashOfThemeScript ssrTheme={Boolean(ssrTheme)} />
      </head>
      <body>
        {isMobileLayout ? <MobileNav /> : <Sidebar />}
        <main className="p-5 sm:px-10 lg:mx-64 lg:mt-0 lg:p-10">
          <div className="mx-auto lg:max-w-2xl">
            <Outlet />
          </div>
          <div className="fixed left-auto right-10 top-10 hidden lg:block">
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

function ErrorPage({title, reason}: ErrorWrapperProps) {
  return (
    <html lang="en" className="light">
      <head>
        <Links />
        <title>Oh no... something went wrong!</title>
      </head>
      <body className="p-5 sm:p-10">
        <MobileNav />
        <Sidebar />
        <main className="mt-10 lg:mx-64 lg:mt-0">
          <div className="mx-auto lg:max-w-2xl">
            <ErrorBlock title={title} reason={reason} />
          </div>
        </main>
      </body>
    </html>
  )
}

// We need to wrap the error page in a ThemeProvider because MobileNav uses
// the ThemeSwitch component which uses the useTheme hook.
function ErrorWrapper({title, reason}: ErrorWrapperProps) {
  return (
    <ThemeProvider ssrTheme={null}>
      <ErrorPage title={title} reason={reason} />
    </ThemeProvider>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const location = useLocation()

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <ErrorWrapper
          title="404 - Oh no... You found a broken link :("
          reason={`No page was found at ${location.pathname}. Please try going back to the homepage.`}
        />
      )
    }

    return (
      <ErrorWrapper
        title="Oh no... Something did not go well"
        reason={error.data}
      />
    )
  }

  console.error(error)

  if (error instanceof Error) {
    return (
      <ErrorWrapper
        title="Oh no... Something went wrong!"
        reason={error.message}
      />
    )
  }

  return <ErrorWrapper title="Oh no... Something went wrong!" />
}
