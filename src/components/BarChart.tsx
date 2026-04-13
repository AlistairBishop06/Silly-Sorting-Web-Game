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
    <div className="h-64 w-full rounded-2xl border border-zinc-200/70 bg-white/55 p-4 shadow-lg shadow-violet-500/5 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/35 dark:shadow-violet-500/10">
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
                    'w-full rounded-lg transition-[height,filter] duration-300 ease-in-out will-change-[height,transform] shadow-sm',
                    isHot
                      ? 'bg-gradient-to-t from-amber-400 via-orange-400 to-rose-400 dark:from-amber-300 dark:via-orange-300 dark:to-rose-300'
                      : 'bg-gradient-to-t from-violet-600 via-fuchsia-500 to-cyan-400 dark:from-violet-500 dark:via-fuchsia-400 dark:to-cyan-300',
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
