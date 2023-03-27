import {Link, useLoaderData} from '@remix-run/react'
import {getAllPosts} from '~/models/blog.server'

export async function loader() {
  const posts = await getAllPosts()
  if (!posts) {
    throw new Response('Posts not found', {status: 404})
  }
  return {posts}
}

export default function All() {
  const {posts} = useLoaderData<typeof loader>()
  return (
    <>
      {posts.map(post => (
        <div key={post.slug}>
          <Link to={post.slug}>{post.title}</Link>
        </div>
      ))}
    </>
  )
}
