import {Link, useCatch, useLoaderData} from '@remix-run/react'
import ErrorBlock from '~/components/ErrorBlock'
import type {PostAttributes} from '~/models/content.server'
import {getAllPosts} from '~/models/content.server'

export async function loader() {
  const posts = await getAllPosts()
  if (!posts) {
    throw new Response('Posts not found', {status: 404})
  }
  return {posts}
}

export default function Blog() {
  const {posts} = useLoaderData<typeof loader>()

  return (
    <ul>
      {posts.map(post => (
        <BlogPost key={post.slug} post={post} />
      ))}
    </ul>
  )
}

export function BlogPost({post}: {post: PostAttributes}) {
  const postDate = new Date(post.date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <li className="mb-4 last:mb-0">
      <Link to={post.slug} prefetch="intent">
        <h3 className="text-2xl font-bold">{post.title}</h3>
        <p>{postDate}</p>
        <p>{post.summary}</p>
      </Link>
    </li>
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
      <ErrorBlock
        title="Oh no! Something went wrong :("
        reason={error.message}
      />
    )
  }

  return <ErrorBlock title="Oh no! Something went wrong :(" />
}
