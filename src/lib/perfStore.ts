import type { ProfilerOnRenderCallback } from 'react'

/**
 * Tiny external store for live performance numbers.
 * It lives outside React state on purpose: if the measured page stored its own
 * metrics in state, recording a render would cause another render, forever.
 */
export type Metrics = {
  commits: number
  lastRenderMs: number
  slowestRenderMs: number
  inputDelayMs: number | null
  slowestInputMs: number | null
}

const initial: Metrics = { commits: 0, lastRenderMs: 0, slowestRenderMs: 0, inputDelayMs: null, slowestInputMs: null }
let metrics = initial
let pendingKeyAt: number | null = null
const listeners = new Set<() => void>()
let scheduled = false

function emit() {
  // Batch updates to at most one per frame so the panel itself stays cheap
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(() => {
    scheduled = false
    listeners.forEach((l) => l())
  })
}

export const perfStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => metrics,
  reset() {
    metrics = initial
    pendingKeyAt = null
    emit()
  },
  /** Call on keydown in the search box; the next commit tells us how long the keystroke took to show */
  markInput() {
    pendingKeyAt = performance.now()
  },
}

export const onRender: ProfilerOnRenderCallback = (_id, _phase, actualDuration, _base, _start, commitTime) => {
  // commitTime comes after rendering, so this covers the whole render the keystroke caused
  const inputDelayMs = pendingKeyAt !== null ? Math.max(commitTime - pendingKeyAt, actualDuration) : metrics.inputDelayMs
  pendingKeyAt = null
  metrics = {
    commits: metrics.commits + 1,
    lastRenderMs: actualDuration,
    slowestRenderMs: Math.max(metrics.slowestRenderMs, actualDuration),
    inputDelayMs,
    slowestInputMs: inputDelayMs === null ? metrics.slowestInputMs : Math.max(metrics.slowestInputMs ?? 0, inputDelayMs),
  }
  emit()
}
