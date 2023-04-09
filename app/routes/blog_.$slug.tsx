import type {LoaderArgs, MetaFunction} from '@remix-run/node'
import type {LinkProps} from '@remix-run/react'
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'
import {json} from '@vercel/remix'
import {cacheHeader} from 'pretty-cache-header'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import {z} from 'zod'
import CodeBlock from '~/components/CodeBlock'
import ErrorBlock from '~/components/ErrorBlock'
import {getPostByFilename, parseFrontMatter} from '~/models/blog.server'
import blogStyles from '~/styles/blog.css'
import {getIdFromChildren} from '~/utils/get-id-from-children'

const paramsSchema = z.object({slug: z.string()})

export function meta(args: Parameters<MetaFunction<typeof loader>>[0]) {
  const {slug} = z.object({slug: z.string()}).parse(args.params)

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
      content: 'https://gonzalo.stoll.com/images/profile.png',
    },
    {property: 'og:url', content: `https://gonzalo.stoll.com/blog/${slug}`},
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
  const {attributes, body} = parseFrontMatter(markdown)
  return json(
    {attributes, body},
    {
      headers: {
        'Cache-Control': cacheHeader({
          sMaxage: '30days',
          staleWhileRevalidate: '1day',
          staleIfError: '7days',
        }),
      },
    }
  )
}

export default function Index() {
  const {attributes} = useLoaderData<typeof loader>()

  const postDate = new Date(attributes.date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article>
      <h1 className="mb-6 text-2xl font-bold">{attributes.title}</h1>
      <p className="mb-6 text-base">{postDate}</p>
      <MarkdownContainer />
    </article>
  )
}

// We need to memoize this because ReactMarkdown will re-render all defined
// components on every theme change. CodeBlock is an expensive component to
// aggresively re-render.
function MarkdownContainer() {
  const {body} = useLoaderData<typeof loader>()

  return React.useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        includeElementIndex={true}
        components={{
          pre({node, children, ...props}) {
            return <CodeBlock {...props}>{children}</CodeBlock>
          },
          code({children}) {
            return <code className="inline-code">{children}</code>
          },
          p({children}) {
            return <p className="mb-6 text-base">{children}</p>
          },
          h2({children}) {
            const id = getIdFromChildren(children)
            return (
              <h2 id={id} className="-mt-6 mb-6 pt-8 text-xl font-bold">
                <Link to={`#${id}`}>{children}</Link>
              </h2>
            )
          },
          h3({children}) {
            const id = getIdFromChildren(children)
            return (
              <h3 id={id} className="-mt-6 mb-6 pt-8 text-base font-bold">
                <Link to={`#${id}`}>{children}</Link>
              </h3>
            )
          },
          blockquote({children}) {
            return (
              <blockquote className="px-6 text-base !not-italic">
                {children}
              </blockquote>
            )
          },
          em({children}) {
            return <em className="not-italic">"{children}"</em>
          },
          a({children, href}) {
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
        }}
      >
        {body}
      </ReactMarkdown>
    ),
    [body]
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
