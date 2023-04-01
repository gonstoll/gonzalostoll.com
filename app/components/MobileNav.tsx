import {Link} from '@remix-run/react'
import * as React from 'react'
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
  const mobileMenuClass = isMenuOpen
    ? 'top-0 opacity-100'
    : '-top-full opacity-70'
  const menuBtnClass = isMenuOpen
    ? 'before:rotate-45 after:-rotate-45'
    : 'before:-translate-y-2 after:translate-y-2'

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <header className="lg:hidden flex items-center justify-between">
      <Link to="/" onClick={() => setIsMenuOpen(false)}>
        <h1 className="font-bold text-3xl z-20 relative">GS</h1>
      </Link>
      <div className="flex items-center z-20">
        <ThemeSwitch />
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className={`ml-4 h-8 w-8 flex items-center before:bg-black after:bg-black dark:before:bg-white dark:after:bg-white before:rounded-xs after:rounded-xs before:w-8 after:w-8 before:h-1 after:h-1 before:absolute after:absolute  before:transition-toggle after:transition-toggle before:duration-500 after:duration-500 ${menuBtnClass}`}
        />
      </div>
      <div
        className={`z-10 flex items-end p-10 w-full max-h-full fixed bottom-0 left-0 right-0 bg-white dark:bg-black transition-top duration-500 ${mobileMenuClass}`}
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
  const visibleClass = isVisible ? 'top-0' : '-top-20'

  return (
    <div
      className={`bg-white dark:bg-black w-full px-5 sm:px-10 py-4 fixed left-0 transition-top duration-300 z-10 ${visibleClass}`}
    >
      <MobileNav />
    </div>
  )
}
