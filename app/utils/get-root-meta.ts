import type {HtmlMetaDescriptor} from '@vercel/remix'

export function getRootMeta(matches: Array<{meta: Array<HtmlMetaDescriptor>}>) {
  return matches
    .flatMap(match => match.meta ?? [])
    .filter(meta => {
      if ('title' in meta) {
        return false
      }

      if ('property' in meta) {
        return meta.property !== 'og:title'
      }

      return true
    })
}
