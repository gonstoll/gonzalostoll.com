import {useCatch, useLoaderData} from '@remix-run/react'
import Bio from '~/components/Bio'
import BlogPostList from '~/components/BlogPostList'
import ErrorBlock from '~/components/ErrorBlock'
import {getAllPosts} from '~/models/content.server'

export async function loader() {
  const posts = await getAllPosts()
  if (!posts) {
    throw new Response('Posts not found', {status: 404})
  }
  return {posts}
}

export default function HomePage() {
  const {posts} = useLoaderData<typeof loader>()

  return (
    <>
      <Bio />
      <div className="mt-20">
        <p className="mb-10 text-xl">Check out some of my articles:</p>
        <BlogPostList posts={posts} isHome />
      </div>
    </>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  return (
    <ErrorBlock title="Oh no... Something went wrong" reason={caught.data} />
  )
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
