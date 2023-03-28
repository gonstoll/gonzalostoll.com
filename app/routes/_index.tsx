import {useLoaderData} from '@remix-run/react'
import {getAllPosts} from '~/models/blog.server'
import {BlogPost} from './blog'

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
