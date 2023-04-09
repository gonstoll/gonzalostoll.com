import {Link} from '@remix-run/react'
import * as React from 'react'
import {classNames} from '~/utils/classNames'
import NavLinks from './NavLinks'
import ThemeSwitch from './ThemeSwitch'

function useStickyHeader() {
  const [isVisible, setIsVisible] = React.useState(false)
  const position = React.useRef(0)

  React.useEffect(() => {
    function handleScroll() {
      const threshold = 200
      const current = window.scrollY
      const delta = current - position.current
      position.current = current
      setIsVisible(current > threshold && delta < 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return {isVisible}
}

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <header className="flex items-center justify-between lg:hidden">
      <Link to="/" onClick={() => setIsMenuOpen(false)}>
        <h1 className="relative z-20 text-3xl font-bold">GS</h1>
      </Link>
      <div className="z-20 flex items-center">
        <ThemeSwitch />
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className={classNames(
            'ml-4 flex h-8 w-8 items-center before:absolute before:h-1 before:w-8 before:rounded-xs before:bg-black before:transition-toggle before:duration-500 after:absolute after:h-1 after:w-8 after:rounded-xs after:bg-black  after:transition-toggle after:duration-500 dark:before:bg-white dark:after:bg-white',
            {
              'before:rotate-45 after:-rotate-45': isMenuOpen,
              'before:-translate-y-2 after:translate-y-2': !isMenuOpen,
            }
          )}
        />
      </div>
      <div
        className={classNames(
          'fixed bottom-0 left-0 right-0 z-10 flex max-h-full w-full items-end bg-white p-10 transition-top duration-500 dark:bg-black',
          {
            'top-0 opacity-100': isMenuOpen,
            '-top-full opacity-70': !isMenuOpen,
          }
        )}
      >
        <NavLinks
          type="mobile"
          isMobileMenuOpen={isMenuOpen}
          onCloseMobileMenu={() => setIsMenuOpen(false)}
        />
      </div>
    </header>
  )
}

export function MobileStickyNav() {
  const {isVisible} = useStickyHeader()

  return (
    <div
      className={classNames(
        'fixed left-0 z-10 w-full bg-white px-5 py-4 transition-top duration-300 dark:bg-black sm:px-10 lg:hidden',
        {'top-0': isVisible, '-top-20': !isVisible}
      )}
    >
      <MobileNav />
    </div>
  )
}
