import parseFrontMatter from 'front-matter'
import {z} from 'zod'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const ACCOUNT_NAME = process.env.ACCOUNT_NAME
const REPO_NAME = process.env.REPO_NAME
const REPO_URL = `https://api.github.com/repos/${ACCOUNT_NAME}/${REPO_NAME}`
const REPO_DIR = '/contents/content/'

const postSchema = z.object({
  name: z.string(),
  download_url: z.string().url(),
})

export const frontMatterSchema = z.object({
  title: z.string(),
  date: z.string(),
  summary: z.string(),
})

type PostAttributes = z.infer<typeof frontMatterSchema> & {slug: string}

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

async function getPostByUrl(url: string) {
  const response = await githubFetch(url)
  const post = await response?.text()
  return post
}

export async function getPostByFilename(fileName: string) {
  const url = new URL(REPO_URL + REPO_DIR + fileName)
  const response = await githubFetch(url.toString())
  const post = await response?.text()
  return post
}

export async function getAllPosts() {
  const url = new URL(REPO_URL + REPO_DIR)
  const response = await githubFetch(url.toString())
  const postsData = await response?.json()
  const posts = postSchema.array().parse(postsData)

  const postAttributes: Array<PostAttributes> = []
  for (const post of posts) {
    const markdown = await getPostByUrl(post.download_url)
    if (!markdown) return
    const {attributes} = parseFrontMatter(markdown)
    postAttributes.push({
      ...frontMatterSchema.parse(attributes),
      slug: post.name.replace('.md', ''),
    })
  }

  return postAttributes
}
