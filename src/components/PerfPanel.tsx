import { useEffect, useState, useSyncExternalStore } from 'react'
import { perfStore } from '../lib/perfStore'

function tone(ms: number | null, good: number, ok: number) {
  if (ms === null) return 'text-muted'
  return ms <= good ? 'text-good' : ms <= ok ? 'text-amber-600' : 'text-bad'
}

const fmt = (ms: number | null) => (ms === null ? '–' : `${ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`)

/** Live numbers for the page it sits on. It is rendered outside the measured <Profiler>. */
export default function PerfPanel() {
  const m = useSyncExternalStore(perfStore.subscribe, perfStore.getSnapshot)
  const [dom, setDom] = useState({ nodes: 0, rows: 0 })

  useEffect(() => {
    perfStore.reset()
    const sample = () =>
      setDom({ nodes: document.getElementsByTagName('*').length, rows: document.querySelectorAll('[data-row]').length })
    sample()
    const t = window.setInterval(sample, 1000)
    return () => window.clearInterval(t)
  }, [])

  const items = [
    { label: 'Slowest keystroke', value: fmt(m.slowestInputMs), cls: tone(m.slowestInputMs, 50, 150), hint: 'Key press to screen' },
    { label: 'Last render', value: fmt(m.lastRenderMs), cls: tone(m.commits ? m.lastRenderMs : null, 16, 50), hint: 'React render time' },
    { label: 'Slowest render', value: fmt(m.slowestRenderMs), cls: tone(m.commits ? m.slowestRenderMs : null, 16, 50), hint: 'Since page load' },
    { label: 'Renders', value: m.commits.toLocaleString(), cls: 'text-ink', hint: 'React commits so far' },
    { label: 'DOM nodes', value: dom.nodes.toLocaleString(), cls: dom.nodes > 3000 ? 'text-bad' : 'text-good', hint: 'Elements on the page' },
    { label: 'Rows in DOM', value: dom.rows.toLocaleString(), cls: 'text-ink', hint: 'Product rows rendered' },
  ]

  return (
    <aside aria-label="Live performance metrics" className="rounded-2xl border border-line bg-white p-4">
      <p className="text-xs font-bold tracking-wider text-muted uppercase">Live metrics</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((i) => (
          <div key={i.label}>
            <dt className="text-xs text-muted">{i.label}</dt>
            <dd className={`font-mono text-lg font-semibold ${i.cls}`}>{i.value}</dd>
            <dd className="text-[11px] text-muted">{i.hint}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
