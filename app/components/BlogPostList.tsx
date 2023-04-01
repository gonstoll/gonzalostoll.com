import {Link} from '@remix-run/react'
import type {PostAttributes} from '~/models/content.server'

type Props = {
  posts: Array<PostAttributes>
  isHome?: boolean
}

export default function BlogPostList({posts, isHome}: Props) {
  return (
    <ul>
      {posts.map(post => (
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

function BlogPost({post}: {post: PostAttributes}) {
  const postDate = new Date(post.date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <li className="mb-10 last:mb-0">
      <Link to={post.slug} prefetch="intent">
        <h3 className="text-xl font-bold">{post.title}</h3>
        <p className="my-2">{postDate}</p>
        <p className="text-xl">{post.summary}</p>
      </Link>
    </li>
  )
}
