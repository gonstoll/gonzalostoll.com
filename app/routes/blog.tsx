import {json} from '@remix-run/node'
import {useCatch, useLoaderData} from '@remix-run/react'
import BlogPostList from '~/components/BlogPostList'
import ErrorBlock from '~/components/ErrorBlock'
import {getAllPosts} from '~/models/blog.server'

export function meta() {
  return {
    title: 'Gonzalo Stoll - Blog',
    'og:title': 'Gonzalo Stoll - Blog',
  }
}

export async function loader() {
  const posts = await getAllPosts()
  if (!posts) {
    throw new Response('Posts not found', {status: 404})
  }
  return json({posts})
}

export default function Blog() {
  const {posts} = useLoaderData<typeof loader>()

  return <BlogPostList posts={posts} />
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return (
      <ErrorBlock
        title="Oh no... Something went wrong!"
        reason="No posts were found here. Please try again later, or contact me if the problem persists."
      />
    )
  }

  throw new Error(`Unhandled error status: ${caught.status}`)
}

export function ErrorBoundary({error}: {error: unknown}) {
  console.error(error)

  if (error instanceof Error) {
    return (
      <ErrorBlock
        title="Oh no... Something went wrong!"
        reason={error.message}
      />
    )
  }

  return <ErrorBlock title="Oh no... Something went wrong!" />
}
