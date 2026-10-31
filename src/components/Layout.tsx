import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Case study' },
  { to: '/before', label: 'Before' },
  { to: '/after', label: 'After' },
]

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 h-16 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-extrabold">
            <img src="/favicon.svg" alt="" className="size-8" />
            <span className="hidden sm:inline">React Performance Case Study</span>
          </NavLink>
          <nav aria-label="Main">
            <ul className="flex gap-1">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end
                    className={({ isActive }) => `rounded-full px-3.5 py-2 text-sm font-semibold ${isActive ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <Suspense fallback={<p className="p-10 text-center text-muted" role="status">Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
