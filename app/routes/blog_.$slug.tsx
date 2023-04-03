import type {LoaderArgs, MetaFunction} from '@remix-run/node'
import {useCatch, useLoaderData} from '@remix-run/react'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import {z} from 'zod'
import CodeBlock from '~/components/CodeBlock'
import ErrorBlock from '~/components/ErrorBlock'
import {getPostByFilename, parseFrontMatter} from '~/models/content.server'
import blogStyles from '~/styles/blog.css'

const paramsSchema = z.object({slug: z.string()})

export function meta(args: Parameters<MetaFunction<typeof loader>>[0]) {
  const {slug} = z.object({slug: z.string()}).parse(args.params)
  const keywords = args.data.attributes.meta.keywords.join(', ')

  return {
    title: `Gonzalo Stoll - ${args.data.attributes.title}`,
    description: args.data.attributes.summary,
    keywords: keywords,
    'og:title': `Gonzalo Stoll - ${args.data.attributes.title}`,
    'og:description': args.data.attributes.summary,
    'og:image': 'https://gonzalo.stoll.com/images/profile.png',
    'og:url': `https://gonzalo.stoll.com/blog/${slug}`,
    'og:type': 'article',
    'article:published_time': args.data.attributes.date,
    'article:author': 'Gonzalo Stoll',
    'article:tag': keywords,
  }
}

export function links() {
  return [{rel: 'stylesheet', href: blogStyles}]
}

export async function loader({params}: LoaderArgs) {
  const {slug} = paramsSchema.parse(params)
  const markdown = await getPostByFilename(`${slug}.md`)
  if (!markdown) {
    throw new Response('Post not found', {status: 404})
  }
  const {attributes, body} = parseFrontMatter(markdown)
  return {attributes, body}
}

export default function Index() {
  const {attributes} = useLoaderData<typeof loader>()

  const postDate = new Date(attributes.date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">{attributes.title}</h1>
      <p className="mb-6 text-base">{postDate}</p>
      <MarkdownContainer />
    </>
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
  return (
    <ErrorBlock title="Oh no... Something went wrong" reason={caught.data} />
  )
}
