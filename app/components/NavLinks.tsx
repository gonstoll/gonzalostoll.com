import {Link, useLocation} from '@remix-run/react'

const LINKS = [
  {name: 'Blog', to: '/blog'},
  {name: 'About', to: '/about'},
  {name: 'Stack / setup', to: '/i-use'},
  {name: 'Github', to: 'https://github.com/gonstoll'},
  {name: 'Contact', to: '/contact'},
]

function NavLink({
  to,
  children,
  ...rest
}: Omit<Parameters<typeof Link>['0'], 'to'> & {to: string}) {
  const location = useLocation()
  const isSelected =
    to === location.pathname || location.pathname.startsWith(`${to}/`)
  const composedClassName = `font-normal ${isSelected ? 'font-bold' : ''}`

  return (
    <li className="mb-4">
      <Link prefetch="intent" className={composedClassName} to={to} {...rest}>
        {children} →
      </Link>
    </li>
  )
}

export default function NavLinks() {
  return (
    <nav>
      <ul>
        {LINKS.map(link => (
          <NavLink key={link.to} to={link.to}>
            {link.name}
          </NavLink>
        ))}
      </ul>
    </nav>
  )
}
