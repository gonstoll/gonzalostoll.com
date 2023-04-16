import type {V2_MetaFunction} from '@remix-run/node'
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'
import {json} from '@vercel/remix'
import {cacheHeader} from 'pretty-cache-header'
import BlogPostList from '~/components/BlogPostList'
import ErrorBlock from '~/components/ErrorBlock'
import {getAllPosts} from '~/models/blog.server'
import {getRootMeta} from '~/utils/get-root-meta'

export const handle = {
  id: 'blog',
  getSiteMapEntries: () => [{route: '/blog', priority: 0.7}],
}

export function meta({matches}: Parameters<V2_MetaFunction<object>>[0]) {
  const parentMeta = getRootMeta(matches)

  return [
    ...parentMeta,
    {title: 'Gonzalo Stoll - Blog'},
    {property: 'og:title', content: 'Gonzalo Stoll - Blog'},
  ]
}

export async function loader() {
  const posts = await getAllPosts()
  if (!posts) {
    throw new Response('Posts not found', {status: 404})
  }
  const headers = {
    'Cache-Control': cacheHeader({
      public: true,
      maxAge: '10mins',
      sMaxage: '7days',
      staleWhileRevalidate: '1year',
      staleIfError: '1year',
    }),
  }
  return json({posts}, {headers})
}

export default function Blog() {
  const {posts} = useLoaderData<typeof loader>()

  return <BlogPostList posts={posts} />
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <ErrorBlock
        title="Oh no... Something went wrong!"
        reason="No posts were found here. Please try again later, or contact me if the problem persists."
      />
    )
  }

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
