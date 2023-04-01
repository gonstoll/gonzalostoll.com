import frontMatter from 'front-matter'
import {z} from 'zod'
import fs from 'fs/promises'
import path from 'path'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const ACCOUNT_NAME = process.env.ACCOUNT_NAME
const REPO_NAME = process.env.REPO_NAME
const IS_DEV = process.env.NODE_ENV === 'development'
const REPO_URL = `https://api.github.com/repos/${ACCOUNT_NAME}/${REPO_NAME}`
const ARTICLES_DIR = '/contents/content/articles/'
const CONTENT_DIR = '/contents/content/'

const postSchema = z.object({
  name: z.string(),
  download_url: z.string().url(),
})

const frontMatterSchema = z.object({
  title: z.string(),
  date: z.string(),
  summary: z.string(),
  categories: z.array(z.string()),
  meta: z.object({
    keywords: z.array(z.string()),
  }),
})

export type PostAttributes = z.infer<typeof frontMatterSchema> & {
  slug: string
}

export function parseFrontMatter(markdown: string) {
  const {attributes, body} = frontMatter(markdown)
  const parsedAttributes = frontMatterSchema.parse(attributes)
  return {
    attributes: parsedAttributes,
    body,
  }
}

async function githubFetch(url: string) {
  const headers = new Headers()
  headers.set('Accept', 'application/vnd.github.v3.raw')
  headers.set('Authorization', `token ${ACCESS_TOKEN}`)
  headers.set('User-Agent', 'Gonzalo Stoll portfolio')

  const response = await fetch(url, {headers})
  if (!response.ok || response.status !== 200) {
    if (response.status === 404) {
      return undefined // Not found
    }
    throw Error(
      `Fetching from GitHub failed with ${response.status}: ${response.statusText}`
    )
  }
  return response
}

async function readContent(fileName: string, isPost = false) {
  const content = await fs.readFile(
    path.resolve(
      __dirname,
      isPost ? `../content/articles/${fileName}` : `../content/${fileName}`
    )
  )
  return content.toString()
}

export async function getContentByFilaname(fileName: string) {
  if (IS_DEV) {
    console.log('📚 Fetching content from local environment')
    const content = await readContent(fileName)
    return content
  }

  const url = new URL(REPO_URL + CONTENT_DIR + fileName)
  const response = await githubFetch(url.toString())
  const content = await response?.text()
  return content
}

async function getPostByUrl(url: string) {
  const response = await githubFetch(url)
  const post = await response?.text()
  return post
}

export async function getPostByFilename(fileName: string) {
  if (IS_DEV) {
    console.log('📚 Fetching post from local environment')
    const post = await readContent(fileName, true)
    return post
  }

  const url = new URL(REPO_URL + ARTICLES_DIR + fileName)
  const response = await githubFetch(url.toString())
  const post = await response?.text()
  return post
}

export async function getAllPosts() {
  const postAttributes: Array<PostAttributes> = []

  if (IS_DEV) {
    console.log('📚 Fetching posts from local environment')
    const posts = await fs.readdir(
      path.resolve(__dirname, '../content/articles')
    )
    for (const post of posts) {
      const markdown = await readContent(post, true)
      if (!markdown) return
      const {attributes} = parseFrontMatter(markdown)
      postAttributes.push({
        ...attributes,
        slug: post.replace('.md', ''),
      })
    }
    return postAttributes
  }

  const url = new URL(REPO_URL + ARTICLES_DIR)
  const response = await githubFetch(url.toString())
  const postsData = await response?.json()
  const posts = postSchema.array().parse(postsData)

  for (const post of posts) {
    const markdown = await getPostByUrl(post.download_url)
    if (!markdown) return
    const {attributes} = parseFrontMatter(markdown)
    postAttributes.push({
      ...attributes,
      slug: post.name.replace('.md', ''),
    })
  }

  return postAttributes
}
