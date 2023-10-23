import type {LoaderFunctionArgs} from '@remix-run/node'
import type {SatoriOptions} from 'satori'
import satori from 'satori'
import svg2img from 'svg2img'
import {z} from 'zod'

async function getFont(
  font: string,
  weights = [400, 500, 600, 700],
  text = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\!@#$%^&*()_+-=<>?[]{}|;:,.`\'’"–—',
) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${font}:wght@${weights.join(
      ';',
    )}&text=${encodeURIComponent(text)}`,
    {
      headers: {
        // Make sure it returns TTF.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
      },
    },
  ).then(response => response.text())

  const resource = css.matchAll(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/g,
  )

  return Promise.all(
    [...resource]
      .map(match => match[1])
      .map(url => fetch(url).then(response => response.arrayBuffer()))
      .map(async (buffer, i) => ({
        name: font,
        style: 'normal',
        weight: weights[i],
        data: await buffer,
      })),
  ) as Promise<SatoriOptions['fonts']>
}

type Props = {
  title: string
  description: string
  readingTime: string
}

function Content({title, description, readingTime}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundImage:
          'linear-gradient(140deg, rgb(76, 200, 200), rgb(32, 32, 51))',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.4,
      }}
    >
      <div
        style={{
          width: '80%',
          minHeight: '120px',
          backgroundColor: 'rgba(31, 31, 40, .75)',
          borderRadius: '10px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{display: 'flex', alignItems: 'center', gap: '7px', flex: 1}}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '6px',
                backgroundColor: 'hsla(0,0%,100%,.2)',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '6px',
                backgroundColor: 'hsla(0,0%,100%,.2)',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '6px',
                backgroundColor: 'hsla(0,0%,100%,.2)',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#909090',
              flex: 3,
            }}
          >
            <h3 style={{margin: 0, fontSize: '12px', fontWeight: 400}}>
              Check out this article - {readingTime} minutes read
            </h3>
          </div>
          <div style={{flex: 1}} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '25px',
            color: '#dddddd',
            textAlign: 'left',
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '10px',
              marginTop: 0,
            }}
          >
            {title}
          </h1>
          <h2 style={{fontSize: '16px', fontWeight: 400, margin: 0}}>
            {description}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '35px',
              gap: '10px',
            }}
          >
            <div style={{width: '60px', height: '60px', display: 'flex'}}>
              <img
                src="https://www.gonzalostoll.com/images/profile.png"
                style={{borderRadius: '50px'}}
                alt="Gonzalo Stoll"
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: '14px',
              }}
            >
              <p style={{marginBottom: '3px', marginTop: 0, fontWeight: 700}}>
                Gonzalo Stoll
              </p>
              <p style={{margin: 0}}>@gonstoll</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const paramsSchema = z.object({
  title: z.string(),
  description: z.string(),
  readingTime: z.string(),
})

export async function loader({request}: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams
  const {title, description, readingTime} = paramsSchema.parse({
    title: params.get('title'),
    description: params.get('description'),
    readingTime: params.get('readingTime'),
  })

  const svg = await satori(
    <Content
      title={title}
      description={description}
      readingTime={readingTime}
    />,
    {
      width: 640,
      height: 360,
      fonts: await getFont('Inter'),
    },
  )

  const {data, error} = await new Promise(
    (resolve: (value: {data: Buffer | null; error: Error | null}) => void) => {
      svg2img(svg, (error, buffer) => {
        if (error) {
          resolve({data: null, error})
        } else {
          resolve({data: buffer, error: null})
        }
      })
    },
  )

  if (error) {
    return new Response(error.toString(), {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
  return new Response(data, {
    headers: {
      'Content-Type': 'image/png',
    },
  })
}
