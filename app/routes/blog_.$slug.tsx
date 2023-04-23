import type {LinkProps} from '@remix-run/react'
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'
import type {HeadersFunction, LoaderArgs, MetaFunction} from '@vercel/remix'
import {json} from '@vercel/remix'
import {cacheHeader} from 'pretty-cache-header'
import type {Components} from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import {z} from 'zod'
import CodeBlock from '~/components/CodeBlock'
import ErrorBlock from '~/components/ErrorBlock'
import {
  getAllPosts,
  getPostByFilename,
  parseFrontMatter,
} from '~/models/blog.server'
import blogStyles from '~/styles/blog.css'
import {getIdFromChildren} from '~/utils/get-id-from-children'
import type {SiteHandle} from '~/utils/sitemap.server'

const handleId = 'blog-post'
export const handle: SiteHandle = {
  id: handleId,
  getSitemapEntries: async () => {
    const posts = await getAllPosts()
    if (!posts) return []
    return posts.map(post => {
      return {route: `/blog/${post.slug}`, priority: 0.7}
    })
  },
}

const markdownComponents = {
  pre: ({node, children, ...props}) => (
    <CodeBlock {...props}>{children}</CodeBlock>
  ),
  code: ({children}) => <code className="inline-code">{children}</code>,
  p: ({children}) => <p className="mb-6 text-base">{children}</p>,
  h2: ({children}) => {
    const id = getIdFromChildren(children)
    return (
      <h2 id={id} className="-mt-6 mb-6 pt-8 text-xl font-bold">
        <Link to={`#${id}`}>{children}</Link>
      </h2>
    )
  },
  h3: ({children}) => {
    const id = getIdFromChildren(children)
    return (
      <h3 id={id} className="-mt-6 mb-6 pt-8 text-base font-bold">
        <Link to={`#${id}`}>{children}</Link>
      </h3>
    )
  },
  blockquote: ({children}) => (
    <blockquote className="px-6 text-base">{children}</blockquote>
  ),
  ul: ({children}) => (
    <ul className="mb-6 list-inside list-disc">{children}</ul>
  ),
  a: ({children, href}) => {
    if (!href) return null

    const props = new Map<LinkProps['target' | 'rel'], string>()
    const isExternal = href.startsWith('http')

    if (isExternal) {
      props.set('target', '_blank')
      props.set('rel', 'noopener noreferrer')
    }

    return (
      <Link
        to={href}
        className="underline hover:text-primary"
        {...Object.fromEntries(props)}
      >
        {children}
      </Link>
    )
  },
} satisfies Components

const paramsSchema = z.object({slug: z.string()})

export function meta(args: Parameters<MetaFunction<typeof loader>>[0]) {
  const {slug} = paramsSchema.parse(args.params)

  if (!args.data) {
    return [{title: 'Gonzalo Stoll - Post not found'}]
  }

  const keywords = args.data.attributes.meta.keywords.join(', ')

  return [
    {title: `Gonzalo Stoll - ${args.data.attributes.title}`},
    {name: 'description', content: args.data.attributes.summary},
    {name: 'keywords', content: keywords},
    {
      property: 'og:title',
      content: `Gonzalo Stoll - ${args.data.attributes.title}`,
    },
    {property: 'og:description', content: args.data.attributes.summary},
    {
      property: 'og:image',
      content: 'https://gonzalostoll.com/images/profile.png',
    },
    {property: 'og:url', content: `https://gonzalostoll.com/blog/${slug}`},
    {property: 'og:type', content: 'article'},
    {
      property: 'article:published_time',
      content: args.data.attributes.date,
    },
    {property: 'article:author', content: 'Gonzalo Stoll'},
    {property: 'article:tag', content: keywords},
  ]
}

export function links() {
  return [
    {rel: 'stylesheet', href: blogStyles},
    {
      rel: 'preload',
      href: '/fonts/dank-mono/regular.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preload',
      href: '/fonts/dank-mono/italic.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  ]
}

export async function loader({params}: LoaderArgs) {
  const {slug} = paramsSchema.parse(params)
  const markdown = await getPostByFilename(`${slug}.md`)
  if (!markdown) {
    throw new Response('Post not found', {status: 404})
  }
  const headers = {
    'Cache-Control': cacheHeader({
      public: true,
      maxAge: '5mins',
      sMaxage: '7days',
      staleWhileRevalidate: '1year',
      staleIfError: '1year',
    }),
  }
  const {attributes, body} = parseFrontMatter(markdown)
  return json({attributes, body}, {headers})
}

export function headers({loaderHeaders}: Parameters<HeadersFunction>[0]) {
  return {
    'Cache-Control': loaderHeaders.get('Cache-Control'),
  }
}

export default function BlogPost() {
  const {attributes, body} = useLoaderData<typeof loader>()

  const postDate = new Date(attributes.date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article>
      <h1 className="mb-6 text-2xl font-bold">{attributes.title}</h1>
      <p className="mb-6 text-base">{postDate}</p>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {body}
      </ReactMarkdown>
    </article>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <ErrorBlock
        title="Oh no... Something went wrong!"
        reason="The post you were looking for was not found. Try going back to the blog page and choose from there!"
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
