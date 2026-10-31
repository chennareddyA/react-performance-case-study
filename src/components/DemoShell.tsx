import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PerfPanel from './PerfPanel'

type Props = { variant: 'before' | 'after'; title: string; intro: string; children: ReactNode }

/** Shared frame for the two demo pages: heading, live metrics, and a link to the other version */
export default function DemoShell({ variant, title, intro, children }: Props) {
  const other = variant === 'before' ? { to: '/after', label: 'See the optimized version →' } : { to: '/before', label: '← See the slow version' }
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${variant === 'before' ? 'bg-red-50 text-bad' : 'bg-teal-50 text-good'}`}>
            {variant === 'before' ? 'Before: slow' : 'After: optimized'}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1 max-w-2xl text-muted">{intro}</p>
        </div>
        <Link to={other.to} className="text-sm font-semibold text-good hover:underline">{other.label}</Link>
      </div>
      <div className="sticky top-16 z-10 mt-6">
        <PerfPanel />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  )
}
