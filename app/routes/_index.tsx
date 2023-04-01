import {useCatch, useLoaderData} from '@remix-run/react'
import ReactMarkdown from 'react-markdown'
import ErrorBlock from '~/components/ErrorBlock'
import {getAllPosts, getContentByFilaname} from '~/models/content.server'
import {BlogPost} from './blog'

export async function loader() {
  const posts = await getAllPosts()
  const aboutMarkdown = await getContentByFilaname('bio.md')
  if (!posts) {
    throw new Response('No posts found', {status: 404})
  }
  if (!aboutMarkdown) {
    throw new Response('No bio content found', {status: 404})
  }
  return {posts, aboutMarkdown}
}

export default function Blog() {
  const {posts, aboutMarkdown} = useLoaderData<typeof loader>()

  return (
    <>
      <ReactMarkdown>{aboutMarkdown}</ReactMarkdown>
      <ul className="mt-4">
        {posts.map(post => (
          <BlogPost
            key={post.slug}
            post={{...post, slug: `blog/${post.slug}`}}
          />
        ))}
      </ul>
    </>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  return <ErrorBlock title="Oh no! Something went wrong" reason={caught.data} />
}

export function ErrorBoundary({error}: {error: unknown}) {
  console.error(error)

  if (error instanceof Error) {
    return (
      <ErrorBlock title="Oh no! Something went wrong" reason={error.message} />
    )
  }

  return <ErrorBlock title="Oh no! Something went wrong :(" />
}
