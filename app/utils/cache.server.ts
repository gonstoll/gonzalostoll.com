import {ENV} from 'env'
import type {CachedPostAttributes} from '~/models/blog.server'

let cache: Map<string, CachedPostAttributes>

declare global {
  var __cache__: Map<string, CachedPostAttributes> | undefined
}

// This is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new empty cache with every change either.
if (ENV.NODE_ENV === 'production') {
  cache = new Map()
} else {
  if (!global.__cache__) {
    global.__cache__ = new Map()
  }
  cache = global.__cache__
}

export {cache}
