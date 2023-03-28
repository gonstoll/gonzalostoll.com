import {Link, useLoaderData} from '@remix-run/react'
import type {PostAttributes} from '~/models/blog.server'
import {getAllPosts} from '~/models/blog.server'

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
    <>
      <h1>Blog!</h1>
      <ul>
        {posts.map(post => (
          <BlogPost key={post.slug} post={post} />
        ))}
      </ul>
    </>
  )
}

export function BlogPost({post}: {post: PostAttributes}) {
  const postDate = new Date(post.date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <li>
      <Link to={post.slug}>
        <h3 className="text-2xl font-bold">{post.title}</h3>
        <p>{postDate}</p>
        <p>{post.summary}</p>
      </Link>
    </li>
  )
}
