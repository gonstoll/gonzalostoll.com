import type {ServerRuntimeMetaDescriptor} from '@remix-run/server-runtime'

export function getRootMeta(
  matches: Array<{meta: Array<ServerRuntimeMetaDescriptor>}>,
) {
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
