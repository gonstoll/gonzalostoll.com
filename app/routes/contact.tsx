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
    <>
      <a className="block text-xl hover:text-primary" href="tel:+4550205677">
        +45 50 20 56 77
      </a>
      <a
        className="block text-xl hover:text-primary"
        href="mailto:stollgonzalo@gmail.com"
      >
        stollgonzalo@gmail.com
      </a>
      <a
        className="block text-xl hover:text-primary"
        href="https://www.linkedin.com/in/gonzalostoll/"
        target="_blank"
        rel="noopener noreferrer"
      >
        linkedin.com/in/gonzalostoll
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="/docs/Gonzalo_Stoll_2023.pdf"
        className="block text-xl hover:text-primary"
      >
        Resume ↓
      </a>
    </>
  )
}
