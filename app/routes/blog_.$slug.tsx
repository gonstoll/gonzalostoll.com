import type {LoaderArgs, MetaFunction} from '@remix-run/node'
import {useCatch, useLoaderData} from '@remix-run/react'
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
// components on every change. CodeBlock is an expensive component to
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
          h2({children}) {
            return <h1 className="mt-8 mb-6 text-xl font-bold">{children}</h1>
          },
          h3({children}) {
            return <h1 className="mt-8 mb-6 text-base font-bold">{children}</h1>
          },
          p({children}) {
            return <p className="mb-6 text-base">{children}</p>
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
        }}
      >
        {body}
      </ReactMarkdown>
    ),
    [body]
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return (
      <ErrorBlock
        title="Oh no... Something went wrong!"
        reason="The post you were looking for was not found. Try going back to the blog page and choose from there!"
      />
    )
  }

  throw new Error(`Unhandled status code: ${caught.status}`)
}

export function ErrorBoundary({error}: {error: unknown}) {
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
