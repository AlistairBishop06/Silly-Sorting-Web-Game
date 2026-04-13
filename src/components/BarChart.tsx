import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import clsx from 'clsx'

type Bar = { id: string; value: number }

function randomId() {
  return crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function reconcileBars(prev: Bar[], nextValues: number[]): Bar[] {
  const remaining = [...prev]
  const next: Bar[] = []
  for (const v of nextValues) {
    const idx = remaining.findIndex((b) => b.value === v)
    if (idx >= 0) {
      const [found] = remaining.splice(idx, 1)
      next.push({ ...found, value: v })
      continue
    }
    next.push({ id: randomId(), value: v })
  }
  return next
}

export default function BarChart({
  values,
  highlightIndices,
}: {
  values: number[]
  highlightIndices?: number[]
}) {
  const [bars, setBars] = useState<Bar[]>(() =>
    values.map((v) => ({ id: randomId(), value: v })),
  )
  const refs = useRef(new Map<string, HTMLDivElement>())
  const previousRects = useRef(new Map<string, DOMRect>())

  useEffect(() => {
    setBars((prev) => reconcileBars(prev, values))
  }, [values])

  // FLIP animation for reordering.
  useLayoutEffect(() => {
    const map = refs.current
    previousRects.current = new Map(
      [...map.entries()].map(([id, el]) => [id, el.getBoundingClientRect()]),
    )
  }, [bars.map((b) => b.id).join('|')])

  useLayoutEffect(() => {
    const map = refs.current
    const prev = previousRects.current
    const animations: Array<() => void> = []

    for (const [id, el] of map.entries()) {
      const prevRect = prev.get(id)
      if (!prevRect) continue
      const nextRect = el.getBoundingClientRect()
      const dx = prevRect.left - nextRect.left
      const dy = prevRect.top - nextRect.top
      if (dx === 0 && dy === 0) continue

      animations.push(() => {
        el.style.transform = `translate(${dx}px, ${dy}px)`
        el.style.transition = 'transform 0s'
        requestAnimationFrame(() => {
          el.style.transition = 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)'
          el.style.transform = 'translate(0px, 0px)'
        })
      })
    }

    animations.forEach((fn) => fn())
  }, [bars])

  const maxValue = useMemo(() => {
    const m = Math.max(...values.map((v) => (Number.isFinite(v) ? v : 0)), 1)
    return clamp(m, 1, 200)
  }, [values])

  const highlight = new Set(highlightIndices ?? [])

  return (
    <div className="h-64 w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-full items-end gap-2">
        {bars.map((bar, idx) => {
          const safeValue = Number.isFinite(bar.value) ? bar.value : 0
          const pct = clamp(safeValue / maxValue, 0, 1)
          const heightPct = Math.max(0.02, pct) * 100
          const style: CSSProperties = { height: `${heightPct}%` }
          const isHot = highlight.has(idx)

          return (
            <div key={bar.id} className="flex h-full flex-1 items-end">
              <div className="flex h-full w-full flex-col">
                <div className="flex flex-1 items-end">
                  <div
                    ref={(el) => {
                      if (!el) refs.current.delete(bar.id)
                      else refs.current.set(bar.id, el)
                    }}
                    style={style}
                    className={clsx(
                      'w-full rounded-md transition-[height,background-color] duration-300 ease-in-out',
                      isHot
                        ? 'bg-amber-400 dark:bg-amber-300'
                        : 'bg-violet-500 dark:bg-violet-400',
                    )}
                    title={String(safeValue)}
                  />
                </div>
                <div className="mt-2 select-none text-center text-sm font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                  {Math.round(safeValue * 100) / 100}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
