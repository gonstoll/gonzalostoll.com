import type {EntryContext} from '@remix-run/node'

type SitemapEntry = {
  route: string
  lastmod?: string
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
  priority?: 0.0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0
}

export type SiteHandle = {
  id?: string
  getSitemapEntries?: (request: Request) => Promise<Array<SitemapEntry>>
}

function getDomainUrl(request: Request) {
  const host = new URL(request.url).host
  if (!host) {
    throw new Error('Could not determine domain URL.')
  }
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

function removeTrailingSlash(s: string) {
  return s.endsWith('/') ? s.slice(0, -1) : s
}

export async function getSitemapXml(
  request: Request,
  remixContext: EntryContext
) {
  const domainUrl = getDomainUrl(request)

  function getEntry({route, lastmod, changefreq, priority}: SitemapEntry) {
    return `
      <url>
        <loc>${domainUrl}${route}</loc>
        ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
        ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
        ${priority ? `<priority>${priority}</priority>` : ''}
      </url>
    `.trim()
  }

  const rawSitemapEntries = (
    await Promise.all(
      Object.entries(remixContext.routeModules)
        .map(([route, module]) => {
          if (route === 'root') return undefined

          // If the module has a `getSitemapEntries` method, we'll use that
          if (module.handle?.getSitemapEntries) {
            return module.handle.getSitemapEntries(request)
          }

          // Exclude resource routes from the sitemap
          // (these are an opt-in via the getSitemapEntries method)
          if (!('default' in module)) return undefined

          const manifestEntry = remixContext.manifest.routes[route]
          if (!manifestEntry) {
            console.warn(`Could not find a manifest entry for ${route}`)
            return undefined
          }

          // All we are left here are static routes. We need to construct them
          // and the root path
          const entryPath = manifestEntry.path
          let parentId = manifestEntry.parentId
          let parent = parentId ? remixContext.manifest.routes[parentId] : null

          // The `index` route has a `path` of undefined, so we need to check
          // for that
          let path = ''
          if (entryPath) {
            path = removeTrailingSlash(entryPath)
          }

          // We can't handle dynamic routes, so if the handle doesn't have a
          // `getSitemapEntries` method, there's not much else we can do
          if (path.includes(':')) return undefined

          while (parent) {
            path = `${parent.path}/${path}`
            parentId = parent.parentId
            parent = parentId ? remixContext.manifest.routes[parentId] : null
          }

          return {route: removeTrailingSlash(path)}
        })
        .filter(Boolean)
    )
  ).flatMap(entry => entry)

  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
    >
      ${rawSitemapEntries.map(entry => getEntry(entry)).join('')}
    </urlset>
  `.trim()
}
