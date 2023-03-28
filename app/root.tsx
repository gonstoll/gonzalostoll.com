import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import globalStyles from '~/styles/global.css'
import Sidebar from './components/Sidebar'

export function meta() {
  return {
    charset: 'utf-8',
    title: 'Gonzalo Stoll',
    viewport: 'width=device-width,initial-scale=1',
  }
}

export function links() {
  return [
    {rel: 'stylesheet', href: globalStyles},
  ]
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full p-10">
        <Sidebar />
        <main className="lg:mx-64">
          <div className="mx-auto max-w-2xl">
            <Outlet />
          </div>
          <div className="w-8 h-8 rounded-full bg-black fixed top-10 right-10 left-auto" />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
