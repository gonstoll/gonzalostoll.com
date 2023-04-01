import ReactMarkdown from 'react-markdown'
import Bio from '~/components/Bio'

const markdown = `
## Technologies

With [React](https://react.dev/) always by my side, I’m currently hacking with [Remix](https://remix.run), [Typescript](https://www.typescriptlang.org/) and [Tailwind](https://tailwindcss.com/) (the stack used for this portfolio). I’ve also worked with:

- [Next.js](https://nextjs.org/)
- [Tanstack Query](https://tanstack.com/query/latest)
- [Jest](https://jestjs.io/), [React testing library](https://testing-library.com/), [Playwright](https://playwright.dev/)

## Setup

I work on a M2 Macbook Air (midnight blue), but my setup also includes:

- Screen: [LG 27UL650-W 4K Ultra HD IPS 27”](https://www.computersalg.dk/i/5595771/lg-27ul650-w-69cm-27-zoll-led-ips-panel-4k-uhd-hdr-400-amd-freesync-h%C3%B6henverstellung)
- Keyboard: [KBD67 V3 Aluminium Case Mirror](https://www.maxgaming.com/en/cases/kbd67-v3-aluminium-case-mirror), [Gazzew Bobagum Silent Linear 62g](https://www.eloquentclicks.com/product/gazzew-bobagum-silent-linear-switch-62g-clear-top/), [KBDfans Clear2048 Transparent Keycaps Set Cherry Profile](https://kbdfans.com/products/clear2048-keycaps-set)
- Microphone: [Røde NT-USB Mini](https://rode.com/en/microphones/usb/nt-usb-mini)
- Mouse: Magic mouse (black)`

export default function AboutPage() {
  return (
    <>
      <img
        src="/images/profile.png"
        alt="Gonzalo Stoll"
        className="max-w-xxs mb-6"
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
                rel="noreferrer"
              >
                {children}
              </a>
            ),
            ul: ({children}) => <ul>{children}</ul>,
            li: ({children}) => <li>{children}</li>,
            h2: ({children}) => (
              <h2 className="text-xl mt-20 mb-6">{children}</h2>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </>
  )
}
