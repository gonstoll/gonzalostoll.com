import {frontMatterSchema, getPostByFilename} from '~/models/blog.server'
import parseFrontMatter from 'front-matter'
import {useLoaderData} from '@remix-run/react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import CodeBlock from '~/components/CodeBlock'

export async function loader() {
  const markdown = await getPostByFilename('use-utility-functions.md')
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
