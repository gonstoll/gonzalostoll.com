import {Link, useLocation} from '@remix-run/react'

const LINKS = [
  {name: 'Blog', to: '/blog'},
  {name: 'About', to: '/about'},
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
  const computedClassName = `${
    isSelected ? 'text-primary' : 'font-normal hover:text-primary'
  }`

  return (
    <li className="mb-4 last:mb-0 text-xl">
      <Link prefetch="intent" className={computedClassName} to={to} {...rest}>
        {children} →
      </Link>
    </li>
  )
}

type MobileProps = {
  type: 'mobile'
  isMobileMenuOpen: boolean
  onCloseMobileMenu: () => void
}

type DesktopProps = {
  type: 'desktop'
}

export default function NavLinks(props: MobileProps | DesktopProps) {
  const computedClassName =
    props.type === 'mobile'
      ? `transition-opacity duration-300 ease-in-out ${
          props.isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
        }`
      : ''

  return (
    <nav className={computedClassName}>
      <ul className="duration">
        {LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() =>
              props.type === 'mobile' ? props.onCloseMobileMenu() : null
            }
          >
            {link.name}
          </NavLink>
        ))}
      </ul>
    </nav>
  )
}
