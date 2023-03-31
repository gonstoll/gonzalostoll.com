import {Link} from '@remix-run/react'
import NavLinks from './NavLinks'

export default function Sidebar() {
  return (
    <header className="hidden lg:block fixed left-10 top-10 bottom-10 w-64">
      <div className="flex flex-col h-full">
        <div className="mb-auto">
          <Link to="/">
            <h1 className="font-bold text-4xl">Gonzalo Stoll</h1>
            <h2>Frontend Engineer</h2>
          </Link>
        </div>
        <NavLinks type="desktop" />
      </div>
    </header>
  )
}
