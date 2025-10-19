import {Link} from '@remix-run/react'
import type {PostAttributesWithData} from '~/models/blog.server'

type Props = {
  posts: Array<PostAttributesWithData>
  isHome?: boolean
}

export function BlogPostList({posts, isHome}: Props) {
  return (
    <>
      {posts?.map(post => (
        <BlogPost
          key={post.slug}
          post={{
            ...post,
            slug: isHome ? `blog/${post.slug}` : post.slug,
          }}
        />
      ))}
    </>
  )
}

function BlogPost({post}: {post: PostAttributesWithData}) {
  const postDate = new Date(post.date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="mb-10 last:mb-0">
      <Link to={post.slug} prefetch="intent">
        <header>
          <h2 className="text-xl font-bold">{post.title}</h2>
          <time className="my-2 block">
            {postDate} - {post.readTime} minutes read
          </time>
        </header>
        <p className="text-xl">{post.summary}</p>
      </Link>
    </article>
  )
}
