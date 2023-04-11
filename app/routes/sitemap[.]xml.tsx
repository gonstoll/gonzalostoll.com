import {getAllPosts} from "~/models/blog.server"

export async function loader() {
  const posts = await getAllPosts()
  if (!posts) {
    throw new Response('Posts not found', {status: 404})
  }

  const rootUrl = 'https://gonzalostoll.com'

  const postItems = posts.map(post => `
    <url>
      <loc>${rootUrl}/blog/${post.slug}</loc>
      <priority>0.7</priority>
    </url>
  `).join('').trim()

  const xml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
    >
      <url>
        <loc>${rootUrl}</loc>
      </url>
      <url>
        <loc>${rootUrl}/about</loc>
      </url>
      <url>
        <loc>${rootUrl}/contact</loc>
      </url>
      <url>
        <loc>${rootUrl}/blog</loc>
        <priority>0.7</priority>
      </url>
      ${postItems}
    </urlset>
  `.trim()

  console.log(xml)

  // Return the response with the content, a status 200 message, and the appropriate headers for an XML page
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
    },
  })
}