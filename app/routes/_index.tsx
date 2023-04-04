import {useCatch, useLoaderData} from '@remix-run/react'
import {json} from '@vercel/remix'
import Bio from '~/components/Bio'
import BlogPostList from '~/components/BlogPostList'
import ErrorBlock from '~/components/ErrorBlock'
import {getAllPosts} from '~/models/blog.server'

export async function loader() {
  const posts = await getAllPosts()
  if (!posts) {
    throw new Response('Posts not found', {status: 404})
  }
  return json({posts})
}

export default function HomePage() {
  const {posts} = useLoaderData<typeof loader>()

  return (
    <>
      <Bio isHome />
      <div className="mt-20">
        <p className="mb-10 text-xl">
          Feel free to check out my coding skills on{' '}
          <a
            className="hover:text-primary"
            href="https://github.com/gonstoll"
            target="_blank"
            rel="noopener noreferrer"
          >
            my GitHub page
          </a>
          . I'm also very enthusiastic about writing and have published various
          posts that you can explore below.
        </p>
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
