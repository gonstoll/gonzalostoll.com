import type {LoaderArgs, MetaFunction} from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
  useOutlet,
} from '@remix-run/react'
import * as React from 'react'
import {CSSTransition, SwitchTransition} from 'react-transition-group'
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

export function meta({data}: Parameters<MetaFunction<typeof loader>>[0]) {
  return {
    charset: 'utf-8',
    title: 'Gonzalo Stoll',
    viewport: 'width=device-width,initial-scale=1',
    description:
      'Gonzalo Stoll is a software engineer and a web developer based in Copenhagen. He is currently working at Workday. He also enjoys writting and mentoring.',
    keywords: 'gonzalo, stoll, gonzalo stoll',
    author: 'Gonzalo Stoll',
    'theme-color': data.theme === 'dark' ? '#1c1c27' : '#fbf9f9',
    'og:title': 'Gonzalo Stoll',
    'og:description':
      'Gonzalo Stoll is a software engineer and a web developer based in Copenhagen. He is currently working at Workday. He also enjoys writting and mentoring.',
    'og:image': 'https://gonzalo.stoll.com/images/profile.png',
    'og:url': 'https://gonzalo.stoll.com',
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

function AnimatedOutlet() {
  const [outlet] = React.useState(useOutlet())
  return outlet
}

function App() {
  const {theme: ssrTheme} = useLoaderData<typeof loader>() || {}
  const {theme} = useTheme()
  const location = useLocation()
  const outletRef = React.useRef<HTMLDivElement>(null)

  return (
    <html lang="en" className={theme || ''}>
      <head>
        <Meta />
        <Links />
        <NonFlashOfThemeScript ssrTheme={Boolean(ssrTheme)} />
      </head>
      <body className="p-5 sm:p-10">
        <MobileNav />
        <MobileStickyNav />
        <Sidebar />
        <main className="mt-10 lg:mx-64 lg:mt-0">
          <div className="mx-auto lg:max-w-2xl">
            <SwitchTransition>
              <CSSTransition
                key={location.pathname}
                timeout={300}
                nodeRef={outletRef}
                classNames={{
                  enter: 'opacity-0',
                  enterActive: 'opacity-100',
                  exitActive: 'opacity-0',
                }}
              >
                <div ref={outletRef} className="transition-all duration-300">
                  <AnimatedOutlet />
                </div>
              </CSSTransition>
            </SwitchTransition>
          </div>
          <div className="fixed top-10 right-10 left-auto hidden lg:block">
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
  const {theme: ssrTheme} = useLoaderData<typeof loader>() || {}

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
        <MobileStickyNav />
        <Sidebar />
        <main className="mt-10 lg:mx-64 lg:mt-0">
          <div className="mx-auto lg:max-w-2xl">
            <ErrorBlock title={title} reason={reason} />
          </div>
        </main>
        <div className="fixed top-10 right-10 left-auto hidden lg:block">
          <ThemeSwitch />
        </div>
      </body>
    </html>
  )
}

function ErrorWrapper({title, reason}: ErrorWrapperProps) {
  return (
    <ThemeProvider ssrTheme={null}>
      <ErrorPage title={title} reason={reason} />
    </ThemeProvider>
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
