import {useLoaderData} from '@remix-run/react'
import ReactMarkdown from 'react-markdown'
import {getContentByFilaname} from '~/models/content.server'

export async function loader() {
  const markdown = await getContentByFilaname('stack-and-setup.md')
  if (!markdown) {
    throw new Response('Page content not found', {status: 404})
  }
  return {markdown}
}

export default function IUsePage() {
  const {markdown} = useLoaderData<typeof loader>()

  return <ReactMarkdown>{markdown}</ReactMarkdown>
}
