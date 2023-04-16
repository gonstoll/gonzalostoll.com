import type {EntryContext} from '@remix-run/node'
import {getSitemapXml} from './utils/sitemap.server'

type Handler = (
  request: Request,
  remixContext: EntryContext
) => Promise<Response | null> | null

const pathedRoutes: Record<string, Handler> = {
  '/sitemap.xml': async (request: Request, remixContext: EntryContext) => {
    const sitemap = await getSitemapXml(request, remixContext)
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Length': String(Buffer.byteLength(sitemap)),
      },
    })
  },
}

// This goes through every route and checks if the path matches the request
// If it does, it returns the handler for that route
// This is then used in the `entry.server.ts` file
export const routes = [
  ...Object.entries(pathedRoutes).map(([path, handler]) => {
    return (request: Request, remixContext: EntryContext) => {
      if (new URL(request.url).pathname !== path) return null

      return handler(request, remixContext)
    }
  }),
]
