// ⚠️ Deliberately slow. Each problem is marked with "SLOW:" and fixed in AfterPage.tsx.
import { Profiler, useEffect, useState } from 'react'
import moment from 'moment' // SLOW: ~70 kB library just to format dates
import _ from 'lodash' // SLOW: imports all of lodash for two helpers
import { products, type Product } from '../data/products'
import { onRender, perfStore } from '../lib/perfStore'
import DemoShell from '../components/DemoShell'

// SLOW: lowercases every field again on every keystroke, for all 10,000 products
function matches(p: Product, query: string) {
  const q = query.toLowerCase().trim()
  if (!q) return true
  return q.split(' ').every((word) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(word))
}

// SLOW: not memoized, so every row re-renders whenever anything on the page changes
function Row({ product, selected, onSelect }: { product: Product; selected: boolean; onSelect: () => void }) {
  const updated = moment(product.updatedAt).fromNow() // SLOW: creates a moment object per row, per render
  return (
    <li
      data-row
      onClick={onSelect}
      className={`flex cursor-pointer items-center gap-4 border-b border-line px-4 py-3 ${selected ? 'bg-teal-50' : 'bg-white hover:bg-slate-50'}`}
    >
      <span className="size-10 shrink-0 rounded-xl" style={{ backgroundColor: `hsl(${product.hue} 70% 85%)` }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{product.name}</p>
        <p className="text-sm text-muted">{product.brand} · {product.category} · updated {updated}</p>
      </div>
      <p className="font-mono font-semibold">${_.round(product.price, 2).toFixed(2)}</p>
    </li>
  )
}

export default function BeforePage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [now, setNow] = useState(() => new Date())

  // SLOW: the clock lives in the page component, so the whole list re-renders every second
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  // SLOW: filtering and sorting run on every render, including every clock tick
  const results = _.sortBy(
    products.filter((p) => matches(p, query)),
    (p) => -moment(p.updatedAt).valueOf(),
  )
  // SLOW: recalculated on every render too
  const avgPrice = _.meanBy(results, 'price') || 0

  return (
    <DemoShell
      variant="before"
      title="Product list: the slow version"
      intro="10,000 products, all rendered at once. Type in the search box and watch the live metrics, or just watch renders climb every second."
    >
      <Profiler id="before" onRender={onRender}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onKeyDown={() => perfStore.markInput()}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 10,000 products, e.g. smart watch"
            aria-label="Search products"
            className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-white px-4 outline-none focus:border-ink"
          />
          <p className="text-sm text-muted">
            {results.length.toLocaleString()} results · avg ${avgPrice.toFixed(2)} · {moment(now).format('HH:mm:ss')}
          </p>
        </div>
        <ul className="mt-4 overflow-hidden rounded-2xl border border-line">
          {results.map((p) => (
            <Row key={p.id} product={p} selected={selected === p.id} onSelect={() => setSelected(p.id)} />
          ))}
        </ul>
      </Profiler>
    </DemoShell>
  )
}
