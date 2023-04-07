import frontMatter from 'front-matter'
import fs from 'fs/promises'
import path from 'path'
import {z} from 'zod'
import {cache} from '~/utils/cache.server'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const ACCOUNT_NAME = process.env.ACCOUNT_NAME
const REPO_NAME = process.env.REPO_NAME
const IS_DEV = process.env.NODE_ENV === 'development'
const REPO_URL = `https://api.github.com/repos/${ACCOUNT_NAME}/${REPO_NAME}`
const ARTICLES_DIR = '/contents/content/articles/'

const postSchema = z.object({
  sha: z.string(),
  name: z.string(),
  download_url: z.string().url(),
})

const postAttributesSchema = z.object({
  title: z.string(),
  date: z.string(),
  summary: z.string(),
  categories: z.array(z.string()),
  meta: z.object({
    keywords: z.array(z.string()),
  }),
})

const postAttributesWithSlugSchema = postAttributesSchema.merge(
  z.object({
    slug: z.string(),
  })
)

type PostAttributes = z.infer<typeof postAttributesSchema>
export type PostAttributesWithSlug = PostAttributes & {
  slug: string
}
export type CachedPostAttributes = PostAttributesWithSlug & {
  sha: string
}

export function parseFrontMatter(markdown: string) {
  const {attributes, body} = frontMatter(markdown)
  const parsedAttributes = postAttributesSchema.parse(attributes)
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

async function readPost(fileName: string) {
  const content = await fs
    .readFile(path.resolve(__dirname, `../content/articles/${fileName}`))
    .catch(error => {
      console.error(error)
      return undefined
    })
  return content?.toString()
}

async function getPostByUrl(url: string) {
  const response = await githubFetch(url)
  const post = await response?.text()
  return post
}

export async function getPostByFilename(fileName: string) {
  if (IS_DEV) {
    console.log('📚 Fetching post from local environment')
    const post = await readPost(fileName)
    return post
  }

  const url = new URL(REPO_URL + ARTICLES_DIR + fileName)
  const response = await githubFetch(url.toString())
  const post = await response?.text()
  return post
}

export async function getAllPosts() {
  const postAttributes: Array<PostAttributesWithSlug> = []

  if (IS_DEV) {
    console.log('📚 Fetching posts from local environment')
    const posts = await fs
      .readdir(path.resolve(__dirname, '../content/articles'))
      .catch(error => {
        console.error(error)
        return undefined
      })

    if (!posts) return

    for (const post of posts) {
      const markdown = await readPost(post)
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
    if (cache.has(post.name)) {
      const cachedPost = cache.get(post.name)
      if (!cachedPost) continue
      if (cachedPost.sha === post.sha) {
        postAttributes.push(cachedPost)
      } else {
        // There is a new SHA, so we need to delete the old entry from the cache
        cache.delete(post.name)
      }
      continue
    }

    const markdown = await getPostByUrl(post.download_url)
    if (!markdown) return
    const {attributes} = parseFrontMatter(markdown)
    const attributesWithSlug = {
      ...attributes,
      slug: post.name.replace('.md', ''),
    }
    postAttributes.push(attributesWithSlug)
    cache.set(post.name, {
      ...attributesWithSlug,
      sha: post.sha,
    })
  }

  return postAttributesWithSlugSchema.array().parse(postAttributes)
}
