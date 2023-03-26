import parseFrontMatter from 'front-matter'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const ACCOUNT_NAME = process.env.ACCOUNT_NAME
const REPO_NAME = process.env.REPO_NAME
const REPO_URL = `https://api.github.com/repos/${ACCOUNT_NAME}/${REPO_NAME}`
const REPO_DIR = '/contents/content/'

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
  const posts = await response?.json()
  const postAttributes: Array<any> = []
  for (const post of posts) {
    const markdown = await getPostByUrl(post.download_url)
    if (!markdown) return
    const {attributes} = parseFrontMatter<{title: string}>(markdown)
    postAttributes.push({...attributes, slug: post.name.replace('.md', '')})
  }
  return postAttributes
}
