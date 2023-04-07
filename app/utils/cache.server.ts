import type {CachedPostAttributes} from '~/models/blog.server'

let cache: Map<string, CachedPostAttributes>

declare global {
  var __cache__: Map<string, CachedPostAttributes> | undefined
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
  cache = new Map()
} else {
  if (!global.__cache__) {
    global.__cache__ = new Map()
  }
  cache = global.__cache__
}

export {cache}
