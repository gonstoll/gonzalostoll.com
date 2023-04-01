import {useCatch, useLoaderData} from '@remix-run/react'
import ErrorBlock from '~/components/ErrorBlock'
import {getAllPosts} from '~/models/content.server'
import {BlogPost} from './blog'

export async function loader() {
  const posts = await getAllPosts()
  if (!posts) {
    throw new Response('No posts found', {status: 404})
  }
  return {posts}
}

export default function Blog() {
  const {posts} = useLoaderData<typeof loader>()

  return (
    <>
      <ul>
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
