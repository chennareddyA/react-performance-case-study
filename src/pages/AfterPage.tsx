// The same page as BeforePage.tsx with each problem fixed. Fixes are marked with "FIX:".
import { memo, Profiler, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { products, type Product } from '../data/products'
import { onRender, perfStore } from '../lib/perfStore'
import DemoShell from '../components/DemoShell'

// FIX: built-in Intl formatters replace moment (0 kB) and are created once, not per row
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

function timeAgo(ms: number, now: number) {
  const days = Math.round((ms - now) / 86_400_000)
  if (Math.abs(days) < 30) return relative.format(days, 'day')
  if (Math.abs(days) < 365) return relative.format(Math.round(days / 30), 'month')
  return relative.format(Math.round(days / 365), 'year')
}

// FIX: search text and timestamps are prepared once, sorted once, instead of on every keystroke
const indexed = products
  .map((p) => ({ product: p, text: `${p.name} ${p.brand} ${p.category}`.toLowerCase(), time: Date.parse(p.updatedAt) }))
  .sort((a, b) => b.time - a.time)

const ROW_HEIGHT = 69

// FIX: memo means a row only re-renders when its own props change
const Row = memo(function Row({
  product,
  time,
  selected,
  onSelect,
}: {
  product: Product
  time: number
  selected: boolean
  onSelect: (id: number) => void
}) {
  return (
    <div
      data-row
      onClick={() => onSelect(product.id)}
      className={`flex h-full cursor-pointer items-center gap-4 border-b border-line px-4 ${selected ? 'bg-teal-50' : 'bg-white hover:bg-slate-50'}`}
    >
      <span className="size-10 shrink-0 rounded-xl" style={{ backgroundColor: `hsl(${product.hue} 70% 85%)` }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{product.name}</p>
        <p className="text-sm text-muted">{product.brand} · {product.category} · updated {timeAgo(time, Date.now())}</p>
      </div>
      <p className="font-mono font-semibold">{price.format(product.price)}</p>
    </div>
  )
})

// FIX: the ticking clock is its own component, so only this text re-renders every second
function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])
  return <>{clock.format(now)}</>
}

export default function AfterPage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<number | null>(null)

  // FIX: the input updates instantly; the expensive filtering uses a deferred copy of the query
  const deferredQuery = useDeferredValue(query)
  const results = useMemo(() => {
    const words = deferredQuery.toLowerCase().trim().split(/\s+/).filter(Boolean)
    return words.length ? indexed.filter((i) => words.every((w) => i.text.includes(w))) : indexed
  }, [deferredQuery])
  const avgPrice = useMemo(() => (results.length ? results.reduce((s, i) => s + i.product.price, 0) / results.length : 0), [results])

  // FIX: stable callback, so memoized rows don't re-render because of a new function
  const onSelect = useCallback((id: number) => setSelected(id), [])

  // FIX: virtualization renders only the ~15 rows on screen, not all 10,000
  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
  })

  return (
    <DemoShell
      variant="after"
      title="Product list: the optimized version"
      intro="The same 10,000 products and features. Only visible rows are rendered, searching stays smooth, and the clock no longer re-renders the list."
    >
      <Profiler id="after" onRender={onRender}>
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
          <p className="text-sm text-muted" aria-live="polite">
            {results.length.toLocaleString()} results · avg ${avgPrice.toFixed(2)} · <Clock />
          </p>
        </div>
        <div
          ref={scrollRef}
          className={`mt-4 h-[70vh] overflow-auto rounded-2xl border border-line bg-white transition-opacity ${query !== deferredQuery ? 'opacity-70' : ''}`}
        >
          <div role="list" style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((v) => {
              const item = results[v.index]
              return (
                <div key={item.product.id} role="listitem" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: v.size, transform: `translateY(${v.start}px)` }}>
                  <Row product={item.product} time={item.time} selected={selected === item.product.id} onSelect={onSelect} />
                </div>
              )
            })}
          </div>
        </div>
      </Profiler>
    </DemoShell>
  )
}
