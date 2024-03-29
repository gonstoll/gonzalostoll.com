import {Link} from '@remix-run/react'
import NavLinks from './NavLinks'

export default function Sidebar() {
  return (
    <header className="fixed bottom-10 left-10 top-10 hidden w-64 lg:block">
      <div className="flex h-full flex-col">
        <div className="mb-auto pb-4">
          <Link title="Gonzalo Stoll" to="/" prefetch="intent">
            <h1 className="text-4xl font-bold">Gonzalo Stoll</h1>
            <h2 className="mt-2 text-xl">Frontend Engineer</h2>
          </Link>
        </div>
        <NavLinks type="desktop" />
      </div>
    </header>
  )
}
