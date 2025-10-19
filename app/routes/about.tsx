import type {MetaFunction} from '@remix-run/node'
import {Link} from '@remix-run/react'
import {cacheHeader} from 'pretty-cache-header'
import ReactMarkdown from 'react-markdown'
import {Bio} from '~/components/Bio'
import {getIdFromChildren} from '~/utils/get-id-from-children'
import {getRootMeta} from '~/utils/get-root-meta'

const markdown = `
## Tech I use

I don't have a specific stack per-se, as I always try to experiment and try new things. Currently, I'm mostly working
with [Typescript](https://www.typescriptlang.org/) and [React](https://react.dev/), and all of what that ecosystem
entails: [React Router](https://reactrouter.com/), [Remix](https://remix.run/), [Next.js](https://nextjs.org/),
[Tailwind](https://tailwindcss.com/), [Jest](https://jestjs.io/), [Playwright](https://playwright.dev/), and many other
tools.

Some other languages I know include Go, Python, Lua and bash.

## Tools I use

I use [Neovim](https://neovim.io/) as my editor of choice (find my configuration
[here](https://github.com/gonstoll/dotfiles/tree/master/.config/nvim)), [ghostty](https://ghostty.org/) as my terminal
emulator and [Arc](https://arc.net/) as my broswer.

## My setup

I work on a M2 Macbook Air, but my setup also includes:

- Keyboards: [Kinesis Advantage360 pro](https://kinesis-ergo.com/shop/adv360pro/)
- Mouse: [Logitech MX Master 3S](https://www.logitech.com/en-us/shop/p/mx-master-3s)
- Headphones: [Sony WH-1000XM4](https://electronics.sony.com/audio/headphones/headband/p/wh1000xm4-b)
`

export function headers() {
  return {
    'Cache-Control': cacheHeader({
      maxAge: '15mins',
      sMaxage: '6months',
      staleWhileRevalidate: '1year',
    }),
  }
}

export function meta({matches}: Parameters<MetaFunction<object>>[0]) {
  const parentMeta = getRootMeta(matches)

  return [
    ...parentMeta,
    {title: 'Gonzalo Stoll - About'},
    {property: 'og:title', content: 'Gonzalo Stoll - About'},
  ]
}

export function links() {
  return [
    {rel: 'canonical', href: 'https://gonzalostoll.com/about'},
    {
      rel: 'preload',
      href: '/images/profile.png',
      as: 'image',
    },
  ]
}

export default function AboutPage() {
  return (
    <>
      <img
        src="/images/profile.png"
        alt="Gonzalo Stoll"
        className="mb-6 max-w-xxs rounded-full"
      />
      <Bio />

      <div className="text-xl">
        <ReactMarkdown
          components={{
            a: ({href, children}) => (
              <a
                className="hover:text-primary"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            h2: ({children}) => {
              const id = getIdFromChildren(children)
              return (
                <h2 id={id} className="mb-6 mt-10 pt-10 text-xl">
                  <Link to={`#${id}`}>{children}</Link>
                </h2>
              )
            },
            ul: ({children}) => <ul>{children}</ul>,
            li: ({children}) => <li>{children}</li>,
            p: ({children}) => <p className="mt-2">{children}</p>,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </>
  )
}
