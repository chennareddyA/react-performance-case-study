import { Link } from 'react-router-dom'
import { lighthouse, measuredOn, results, type Measurement } from '../data/results'

const fixes = [
  {
    problem: 'All 10,000 rows were rendered at once',
    impact: 'Huge DOM, slow first render, every update touched 10,000 rows.',
    fix: 'Virtualized the list so only the rows on screen exist in the DOM.',
    before: `{results.map((p) => (
  <Row key={p.id} product={p} />
))}`,
    after: `const virtualizer = useVirtualizer({
  count: results.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 69,
})
// render virtualizer.getVirtualItems() only`,
  },
  {
    problem: 'Heavy libraries for small jobs',
    impact: 'moment and the whole of lodash were downloaded just to format dates and round prices.',
    fix: 'Replaced them with the browser’s built-in Intl formatters.',
    before: `import moment from 'moment'
import _ from 'lodash'
moment(date).fromNow()`,
    after: `const relative = new Intl.RelativeTimeFormat('en')
const price = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
})`,
  },
  {
    problem: 'A ticking clock re-rendered the whole page',
    impact: 'Clock state lived in the page component, so the full list rendered every second.',
    fix: 'Moved the state into a small <Clock /> component.',
    before: `function Page() {
  const [now, setNow] = useState(new Date())
  // ...10,000 rows re-render every second
}`,
    after: `function Clock() {
  const [now, setNow] = useState(new Date())
  return <>{format(now)}</>
}`,
  },
  {
    problem: 'Repeated work on every render',
    impact: 'Search text was lowercased and dates parsed for every product, on every keystroke and tick.',
    fix: 'Prepared a search index once, and memoized results with useMemo.',
    before: `products.filter((p) =>
  \`\${p.name} \${p.brand}\`.toLowerCase().includes(q))`,
    after: `const indexed = products.map((p) => ({
  product: p, text: \`\${p.name} \${p.brand}\`.toLowerCase(),
}))
const results = useMemo(() => filter(indexed, q), [q])`,
  },
  {
    problem: 'Typing was blocked by filtering',
    impact: 'Each keystroke waited for the whole list to filter and render before appearing.',
    fix: 'useDeferredValue keeps the input instant and filters in the background.',
    before: `const results = filter(products, query)`,
    after: `const deferredQuery = useDeferredValue(query)
const results = useMemo(
  () => filter(indexed, deferredQuery), [deferredQuery])`,
  },
  {
    problem: 'Rows re-rendered for no reason',
    impact: 'A new onSelect function on every render made every row update.',
    fix: 'React.memo on rows plus a stable useCallback handler.',
    before: `<Row onSelect={() => setSelected(p.id)} />`,
    after: `const Row = memo(function Row(...) {...})
const onSelect = useCallback(
  (id) => setSelected(id), [])`,
  },
]

function ResultsTable({ title, rows }: { title: string; rows: Measurement[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[560px] text-left text-sm">
        <caption className="px-5 pt-4 text-left font-bold">{title}</caption>
        <thead className="text-xs text-muted uppercase">
          <tr>
            <th scope="col" className="px-5 py-3">Metric</th>
            <th scope="col" className="px-5 py-3">Before</th>
            <th scope="col" className="px-5 py-3">After</th>
            <th scope="col" className="px-5 py-3">How</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="px-5 py-3 font-semibold">{r.label}</th>
              <td className="px-5 py-3 font-mono text-bad">{r.before}</td>
              <td className="px-5 py-3 font-mono font-semibold text-good">{r.after}</td>
              <td className="px-5 py-3 text-muted">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Code({ label, code, tone }: { label: string; code: string; tone: 'bad' | 'good' }) {
  return (
    <div>
      <p className={`mb-1 text-xs font-bold tracking-wider uppercase ${tone === 'bad' ? 'text-bad' : 'text-good'}`}>{label}</p>
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function CaseStudyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <section className="max-w-3xl">
        <p className="text-sm font-bold tracking-wider text-good uppercase">React performance case study</p>
        <h1 className="mt-3 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
          Fixing a slow React product list
        </h1>
        <p className="mt-5 text-lg text-muted">
          A product list with 10,000 items, search and a live clock, written the way many real apps are: everything rendered at once, heavy libraries, and state in the wrong place. I measured it, found six causes, and fixed each one without removing a single feature.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/before" className="rounded-full border-2 border-ink px-6 py-3 font-bold hover:bg-ink hover:text-white">Try the slow version</Link>
          <Link to="/after" className="rounded-full bg-good px-6 py-3 font-bold text-white hover:bg-teal-700">Try the fixed version</Link>
        </div>
        <p className="mt-4 text-sm text-muted">Tip: on each page, type in the search box and watch the live metrics.</p>
      </section>

      <section aria-labelledby="results-title" className="mt-16 space-y-4">
        <h2 id="results-title" className="text-2xl font-extrabold">Results</h2>
        <ResultsTable title="Rendering and bundle size" rows={results} />
        <p className="text-sm text-muted">Measured on: {measuredOn} Open both demo pages to see live numbers on your own device.</p>
        {lighthouse.length > 0 && <ResultsTable title="Lighthouse (desktop)" rows={lighthouse} />}
      </section>

      <section aria-labelledby="fixes-title" className="mt-16">
        <h2 id="fixes-title" className="text-2xl font-extrabold">What was wrong, and how I fixed it</h2>
        <ol className="mt-6 space-y-6">
          {fixes.map((f, i) => (
            <li key={f.problem} className="rounded-2xl border border-line bg-white p-6">
              <div className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink font-bold text-white">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold">{f.problem}</h3>
                  <p className="mt-1 text-muted">{f.impact}</p>
                  <p className="mt-2 font-semibold text-good">Fix: {f.fix}</p>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <Code label="Before" code={f.before} tone="bad" />
                    <Code label="After" code={f.after} tone="good" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="method-title" className="mt-16 max-w-3xl">
        <h2 id="method-title" className="text-2xl font-extrabold">How I measured</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
          <li><span className="font-semibold text-ink">React Profiler API</span> records every render on both pages and powers the live metrics panel.</li>
          <li><span className="font-semibold text-ink">Lighthouse</span> in Chrome DevTools for load performance, run on the deployed site.</li>
          <li><span className="font-semibold text-ink">Chrome Performance panel</span> to find long tasks while typing.</li>
          <li><span className="font-semibold text-ink">Vite build output</span> for the JavaScript size of each page.</li>
        </ul>
      </section>
    </div>
  )
}
