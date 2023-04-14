import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'
import {json} from '@vercel/remix'
import {cacheHeader} from 'pretty-cache-header'
import Bio from '~/components/Bio'
import BlogPostList from '~/components/BlogPostList'
import ErrorBlock from '~/components/ErrorBlock'
import {getAllPosts} from '~/models/blog.server'

export async function loader() {
  const posts = await getAllPosts()
  if (!posts) {
    throw new Response('Posts not found', {status: 404})
  }
  const headers = {
    'Cache-Control': cacheHeader({
      maxAge: '10mins',
      sMaxage: '7days',
      staleWhileRevalidate: '1year',
      staleIfError: '1year',
    }),
  }
  return json({posts}, {headers})
}

export default function HomePage() {
  const {posts} = useLoaderData<typeof loader>()

  return (
    <>
      <Bio isHome />
      <div className="mt-10">
        <p className="mb-10 text-xl">
          I'm also very enthusiastic about writing and have published various
          posts that you can explore below.
        </p>
        <BlogPostList posts={posts} isHome />
      </div>
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <ErrorBlock title="Oh no... Something went wrong" reason={error.data} />
    )
  }

  console.error(error)

  if (error instanceof Error) {
    return (
      <ErrorBlock title="Oh no! Something went wrong" reason={error.message} />
    )
  }

  return <ErrorBlock title="Oh no! Something went wrong :(" />
}
