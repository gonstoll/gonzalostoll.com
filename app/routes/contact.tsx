export function meta() {
  return {
    title: 'Gonzalo Stoll - Contact',
    'og:title': 'Gonzalo Stoll - Contact',
  }
}

export default function ContactPage() {
  return (
    <>
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
    </>
  )
}
