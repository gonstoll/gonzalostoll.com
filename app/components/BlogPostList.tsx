import {Link} from '@remix-run/react'
import type {PostAttributesWithSlug} from '~/models/blog.server'

type Props = {
  posts: Array<PostAttributesWithSlug>
  isHome?: boolean
}

export default function BlogPostList({posts, isHome}: Props) {
  return (
    <ul>
      {posts?.map(post => (
        <BlogPost
          key={post.slug}
          post={{
            ...post,
            slug: isHome ? `blog/${post.slug}` : post.slug,
          }}
        />
      ))}
    </ul>
  )
}

function BlogPost({post}: {post: PostAttributesWithSlug}) {
  const postDate = new Date(post.date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <li className="mb-10 last:mb-0">
      <Link to={post.slug} prefetch="intent">
        <h2 className="text-xl font-bold">{post.title}</h2>
        <p className="my-2">{postDate}</p>
        <p className="text-xl">{post.summary}</p>
      </Link>
    </li>
  )
}
