import {Link} from '@remix-run/react'
import * as React from 'react'
import NavLinks from './NavLinks'
import ThemeSwitch from './ThemeSwitch'

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const mobileMenuClass = isMenuOpen
    ? 'top-0 opacity-100'
    : '-top-full opacity-70'
  const menuBtnClass = isMenuOpen
    ? 'before:rotate-45 after:-rotate-45'
    : 'before:-translate-y-1 after:translate-y-1'

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <header className="lg:hidden mb-10 flex items-center justify-between">
      <Link to="/">
        <h1 className="font-bold text-2xl z-20 relative">GS</h1>
      </Link>
      <div className="flex items-center z-20">
        <ThemeSwitch />
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className={`ml-6 h-6 w-6 flex items-center before:bg-black after:bg-black before:rounded-sm after:rounded-sm dark:before:bg-white dark:after:bg-white before:w-6 after:w-6 before:h-1 after:h-1 before:absolute after:absolute  before:transition-toggle after:transition-toggle before:duration-500 after:duration-500 ${menuBtnClass}`}
        />
      </div>
      <div
        className={`z-10 flex items-end p-10 w-full max-h-full fixed bottom-0 left-0 right-0 bg-white dark:bg-black transition-top duration-500 ${mobileMenuClass}`}
      >
        <NavLinks type="mobile" isMobileMenuOpen={isMenuOpen} />
      </div>
    </header>
  )
}
