import type {MetaFunction} from '@remix-run/node'
import {Link} from '@remix-run/react'
import {cacheHeader} from 'pretty-cache-header'
import ReactMarkdown from 'react-markdown'
import Bio from '~/components/Bio'
import {getIdFromChildren} from '~/utils/get-id-from-children'
import {getRootMeta} from '~/utils/get-root-meta'

const markdown = `
## Tech I use

I don't have a specific stack per-se, as I always try to experiment and try new things. Currently, I'm mostly working
with [Remix](https://remix.run), [Typescript](https://www.typescriptlang.org/) and [Tailwind](https://tailwindcss.com/),
but I've also worked with [Next.js](https://nextjs.org/), [React Router](https://reactrouter.com/en/main) & [Tanstack
Query](https://tanstack.com/query/latest), [Jest](https://jestjs.io/), [React testing
library](https://testing-library.com/), [Playwright](https://playwright.dev/), and many other tools.

## Tools I use

I use [Neovim](https://neovim.io/) as my editor of choice (find my configuration
[here](https://github.com/gonstoll/dotfiles/tree/master/nvim)), [iTerm2](https://iterm2.com/) as my terminal emulator
and [Arc](https://arc.net/) as my broswer.

## My setup

I work on a M2 Macbook Air (midnight blue), but my setup also includes:

- Screen: [LG 27UL650-W 4K Ultra HD IPS 27”](https://www.computersalg.dk/i/5595771/lg-27ul650-w-69cm-27-zoll-led-ips-panel-4k-uhd-hdr-400-amd-freesync-h%C3%B6henverstellung)
- Microphone: [Røde NT-USB Mini](https://rode.com/en/microphones/usb/nt-usb-mini)
- Keyboards: At home, I use a [QK65 White - Golden weight - Wired ANSI - FR4](https://www.qwertykeys.com) with [PBTFans
Classic Hangul keycaps](https://kbdfans.com/products/pbtfans-classic-hangul) and [Gazzew Bobagum Silent Linear 62g
switches](https://www.eloquentclicks.com/product/gazzew-bobagum-silent-linear-switch-62g-clear-top/). At the office, I
use a [KBD67 V3 Aluminium Case Mirror](https://www.maxgaming.com/en/cases/kbd67-v3-aluminium-case-mirror), with [Gazzew
Bobagum Silent Linear 62g switches](https://www.eloquentclicks.com/product/gazzew-bobagum-silent-linear-switch-62g-clear-top/)
and [Clear2048 Transparent Keycaps Set designed by Mito](https://kbdfans.com/products/clear2048-keycaps-set)
- Mouse: [Magic mouse (black)](https://www.apple.com/dk/shop/product/MMMQ3Z/A/magic-mouse-sort-multi-touch-overflade)
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
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </>
  )
}
