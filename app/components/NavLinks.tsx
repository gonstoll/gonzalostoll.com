import {Link, useLocation} from '@remix-run/react'
import {classNames} from '~/utils/classNames'

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
  const computedClassName = classNames({
    'text-primary': isSelected,
    'font-normal hover:text-primary': !isSelected,
  })

  return (
    <li className="mb-4 text-xl last:mb-0">
      {to.startsWith('http') ? (
        <a
          className={computedClassName}
          href={to}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children} →
        </a>
      ) : (
        <Link prefetch="intent" className={computedClassName} to={to} {...rest}>
          {children} →
        </Link>
      )}
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
      ? classNames(
          'transition-opacity duration-300 ease-in-out',
          {'opacity-100': props.isMobileMenuOpen},
          {'opacity-0': !props.isMobileMenuOpen}
        )
      : ''

  return (
    <nav className={computedClassName}>
      <ul>
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
