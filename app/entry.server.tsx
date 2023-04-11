import type {EntryContext, HandleDataRequestFunction} from '@remix-run/node'
import {RemixServer} from '@remix-run/react'
import {renderToString} from 'react-dom/server'
import {etag} from 'remix-etag'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  )

  if (process.env.NODE_ENV !== 'production') {
    responseHeaders.set('Cache-Control', 'no-store')
  }

  responseHeaders.set('Content-Type', 'text/html')

  const response = new Response('<!DOCTYPE html>' + markup, {
    headers: responseHeaders,
    status: responseStatusCode,
  })

  return etag({request, response, options: {maxAge: 60 * 60}})
}

export async function handleDataRequest(
  response: Response,
  {request}: Parameters<HandleDataRequestFunction>['1']
) {
  return etag({request, response, options: {maxAge: 60 * 60}})
}
