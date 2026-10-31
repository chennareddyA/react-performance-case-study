// Measured results shown on the case study page and in the README.
// Bundle sizes come from `npm run build` (gzip). Lighthouse numbers: see README "How to measure".
export type Measurement = { label: string; before: string; after: string; note: string }

export const results: Measurement[] = [
  { label: 'Slowest keystroke', before: '329 ms', after: '2 ms', note: 'Key press until the screen updates' },
  { label: 'Slowest render', before: '372 ms', after: '4.5 ms', note: 'React Profiler, page load + typing' },
  { label: 'Render on every clock tick', before: '~235 ms', after: '< 1 ms', note: 'Clock state moved into its own component' },
  { label: 'Blocked time while typing', before: '905 ms', after: '0 ms', note: 'Long tasks while typing “smart watch”' },
  { label: 'DOM nodes', before: '60,071', after: '184', note: 'Virtualization renders only visible rows' },
  { label: 'Page JavaScript (gzip)', before: '47.1 kB', after: '9.6 kB', note: 'Route chunk from npm run build' },
]

// Measured in headless Chrome. Replace with your own numbers from your laptop (see README).
export const measuredOn = 'Headless Chrome on a Linux machine; your numbers will differ by device.'

// Optional: add Lighthouse scores from your deployed site (DevTools > Lighthouse > Desktop)
export const lighthouse: Measurement[] = []
