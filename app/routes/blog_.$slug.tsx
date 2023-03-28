import type {LoaderArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import parseFrontMatter from 'front-matter'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import {z} from 'zod'
import CodeBlock from '~/components/CodeBlock'
import {frontMatterSchema, getPostByFilename} from '~/models/blog.server'

const paramsSchema = z.object({
  slug: z.string(),
})

export async function loader({params}: LoaderArgs) {
  const {slug} = paramsSchema.parse(params)
  const markdown = await getPostByFilename(`${slug}.md`)
  if (!markdown) {
    throw new Response('Post not found', {status: 404})
  }
  const {attributes, body} = parseFrontMatter(markdown)
  return {
    attributes: frontMatterSchema.parse(attributes),
    body,
  }
}

export default function Index() {
  const {body, attributes} = useLoaderData<typeof loader>()

  return (
    <>
      <h1 className="text-3xl underline">{attributes.title}</h1>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          pre({node, children, ...props}) {
            return <CodeBlock {...props}>{children}</CodeBlock>
          },
          code({node, inline, children, ...props}) {
            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {body}
      </ReactMarkdown>
    </>
  )
}
