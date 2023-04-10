import type {V2_MetaFunction} from '@remix-run/node'
import {Link} from '@remix-run/react'
import ReactMarkdown from 'react-markdown'
import Bio from '~/components/Bio'
import {getIdFromChildren} from '~/utils/get-id-from-children'
import {getRootMeta} from '~/utils/get-root-meta'

const markdown = `
## Tech I use

With [React](https://react.dev/) always by my side, I’m currently hacking with [Remix](https://remix.run), [Typescript](https://www.typescriptlang.org/) and [Tailwind](https://tailwindcss.com/) (the stack used for this portfolio). I’ve also worked with and have vast experience in:

- [Next.js](https://nextjs.org/)
- [React Router](https://reactrouter.com/en/main) & [Tanstack Query](https://tanstack.com/query/latest)
- [Jest](https://jestjs.io/), [React testing library](https://testing-library.com/), [Playwright](https://playwright.dev/)

## My workflow

My preferred editor is and has been for a long time [VS Code](https://code.visualstudio.com/). There I use the [Night Owl](https://marketplace.visualstudio.com/items?itemName=sdras.night-owl) theme and [Dank Mono](https://philpl.gumroad.com/l/dank-mono) font. I use [warp](https://www.warp.dev/) as my terminal and [Arc](https://arc.net/) as my broswer.

## My setup

I work on a M2 Macbook Air (midnight blue), but my setup also includes:

- Screen: [LG 27UL650-W 4K Ultra HD IPS 27”](https://www.computersalg.dk/i/5595771/lg-27ul650-w-69cm-27-zoll-led-ips-panel-4k-uhd-hdr-400-amd-freesync-h%C3%B6henverstellung)
- Microphone: [Røde NT-USB Mini](https://rode.com/en/microphones/usb/nt-usb-mini)
- Keyboard: [KBD67 V3 Aluminium Case Mirror](https://www.maxgaming.com/en/cases/kbd67-v3-aluminium-case-mirror), [Gazzew Bobagum Silent Linear 62g](https://www.eloquentclicks.com/product/gazzew-bobagum-silent-linear-switch-62g-clear-top/), [KBDfans Clear2048 Transparent Keycaps Set Cherry Profile](https://kbdfans.com/products/clear2048-keycaps-set)
- Mouse: [Magic mouse (black)](https://www.apple.com/dk/shop/product/MMMQ3Z/A/magic-mouse-sort-multi-touch-overflade)
- Headphones: [Sony WH-1000XM4](https://electronics.sony.com/audio/headphones/headband/p/wh1000xm4-b)
`

export function meta({matches}: Parameters<V2_MetaFunction<object>>[0]) {
  const parentMeta = getRootMeta(matches)

  return [
    ...parentMeta,
    {title: 'Gonzalo Stoll - About'},
    {property: 'og:title', content: 'Gonzalo Stoll - About'},
  ]
}

export function links() {
  return [
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
            a({href, children}) {
              return (
                <a
                  className="hover:text-primary"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              )
            },
            ul({children}) {
              return <ul>{children}</ul>
            },
            li({children}) {
              return <li>{children}</li>
            },
            h2({children}) {
              const id = getIdFromChildren(children)
              return (
                <h2 id={id} className="mb-6 mt-10 pt-10 text-xl">
                  <Link to={`#${id}`}>{children}</Link>
                </h2>
              )
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </>
  )
}
