import {Link} from '@remix-run/react'
import NavLinks from './NavLinks'

export default function Sidebar() {
  return (
    <header className="fixed left-10 top-10 bottom-0 w-64">
      <div className="flex flex-col h-full pb-10">
        <div className="mb-auto">
          <Link to="/">
            <h1 className="font-bold text-4xl">Gonzalo Stoll</h1>
            <h2>Frontend Engineer</h2>
          </Link>
        </div>
        <NavLinks />
      </div>
    </header>
  )
}