import type {V2_MetaFunction} from '@remix-run/node'
import {getRootMeta} from '~/utils/get-root-meta'

export function meta({matches}: Parameters<V2_MetaFunction<object>>[0]) {
  const parentMeta = getRootMeta(matches)

  return [
    ...parentMeta,
    {title: 'Gonzalo Stoll - Contact'},
    {property: 'og:title', content: 'Gonzalo Stoll - Contact'},
  ]
}

export default function ContactPage() {
  return (
    <p className="text-xl">
      Shoot me an email at{' '}
      <a className="hover:text-primary" href="mailto:stollgonzalo@gmail.com">
        stollgonzalo@gmail.com
      </a>
      , or give me an good 'ol-fashioned call at{' '}
      <a className="hover:text-primary" href="tel:+4550205677">
        +45 50 20 56 77
      </a>
      .
    </p>
  )
}
