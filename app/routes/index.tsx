import {getPostByFilename} from '~/models/blog.server'
import parseFrontMatter from 'front-matter'
import {useLoaderData} from '@remix-run/react'

export async function loader() {
  const markdown = await getPostByFilename('use-utility-functions.md')
  if (!markdown) {
    throw new Response('Post not found', {status: 404})
  }
  const {attributes, body} = parseFrontMatter<{title: string}>(markdown)
  return {attributes, body}
}

export default function Index() {
  const {body, attributes} = useLoaderData<typeof loader>()

  return (
    <>
      <h1>{attributes.title}</h1>
    </>
  )
}
