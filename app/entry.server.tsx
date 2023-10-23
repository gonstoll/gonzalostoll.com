import {RemixServer} from '@remix-run/react'
import type {EntryContext, HandleDataRequestFunction} from '@remix-run/node'
import {ENV} from 'env'
import {renderToString} from 'react-dom/server'
import {etag} from 'remix-etag'
import {routes as otherRoutes} from './other-routes'

export default async function handleDocumentRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />,
  )

  for (const handler of otherRoutes) {
    const otherRouteResponse = await handler(request, remixContext)
    if (otherRouteResponse) return otherRouteResponse
  }

  if (ENV.NODE_ENV !== 'production') {
    responseHeaders.set('Cache-Control', 'no-store')
  }

  responseHeaders.set('Content-Type', 'text/html')

  const response = new Response('<!DOCTYPE html>' + markup, {
    headers: responseHeaders,
    status: responseStatusCode,
  })

  return etag({request, response})
}

export async function handleDataRequest(
  response: Response,
  {request}: Parameters<HandleDataRequestFunction>['1'],
) {
  return etag({request, response})
}
