import type {LoaderArgs} from '@vercel/remix'
import {getAllPosts} from '~/models/blog.server'
import {getDomainUrl} from '~/utils/get-domain-url'

export async function loader({request}: LoaderArgs) {
  const posts = await getAllPosts()
  const blogUrl = `${getDomainUrl(request)}/blog`

  if (!posts) {
    throw new Response('Posts not found', {status: 404})
  }

  const rss = `
    <rss xmlns:blogChannel="${blogUrl}" version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <channel>
        <title>Gonzalo Stoll Blog</title>
        <link>${blogUrl}</link>
        <description>Gonzalo Stoll's Blog</description>
        <language>en-us</language>
        <ttl>60</ttl>
        <atom:link href="${getDomainUrl(
          request,
        )}/rss.xml" rel="self" type="application/rss+xml" />
        ${posts
          .map(post =>
            `
            <item>
              <title>${cdata(post.title)}</title>
              <description>${cdata(post.summary)}</description>
              <dc:creator>Gonzalo Stoll</dc:creator>
              <pubDate>${
                new Date(post.date).toISOString().split('T')[0] // YYYY-mm-dd
              }</pubDate>
              <link>${blogUrl}/${post.slug}</link>
              <guid isPermaLink="false">${blogUrl}/${post.slug}</guid>
            </item>
          `.trim(),
          )
          .join('\n')}
      </channel>
    </rss>
  `.trim()

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Content-Length': String(Buffer.byteLength(rss)),
      'Cache-Control': 'public, max-age=2419200',
    },
  })
}

function cdata(s: string) {
  return `<![CDATA[${s}]]>`
}
