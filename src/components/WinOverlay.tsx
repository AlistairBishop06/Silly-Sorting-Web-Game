import { useMemo } from 'react'
import Button from './Button'

type ConfettiPiece = {
  id: string
  leftPct: number
  sizePx: number
  delayMs: number
  durationMs: number
  rotateDeg: number
  color: string
  driftPx: number
}

const COLORS = [
  '#7c3aed', // violet
  '#d946ef', // fuchsia
  '#22d3ee', // cyan
  '#f97316', // orange
  '#facc15', // yellow
  '#fb7185', // rose
]

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export default function WinOverlay({
  title,
  subtitle,
  onNext,
}: {
  title: string
  subtitle?: string
  onNext: () => void
}) {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    const count = 80
    const out: ConfettiPiece[] = []
    for (let i = 0; i < count; i++) {
      out.push({
        id: `${Date.now()}_${i}_${Math.random().toString(16).slice(2)}`,
        leftPct: rand(0, 100),
        sizePx: rand(6, 12),
        delayMs: rand(0, 350),
        durationMs: rand(1300, 2100),
        rotateDeg: rand(0, 360),
        color: COLORS[Math.floor(rand(0, COLORS.length))]!,
        driftPx: rand(-140, 140),
      })
    }
    return out
  }, [])

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="confetti-layer">
          {pieces.map((p) => (
            <span
              key={p.id}
              className="confetti-piece"
              style={{
                left: `${p.leftPct}%`,
                width: `${p.sizePx}px`,
                height: `${p.sizePx * 0.55}px`,
                background: p.color,
                animationDelay: `${p.delayMs}ms`,
                animationDuration: `${p.durationMs}ms`,
                transform: `translate3d(0, -40px, 0) rotate(${p.rotateDeg}deg)`,
                ['--confetti-drift' as any]: `${p.driftPx}px`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card pointer-events-auto w-full max-w-lg p-6 text-center shadow-pop">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/45 dark:text-zinc-200">
            Challenge complete
          </div>

          <div className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            <span className="title-gradient">{title}</span>
          </div>

          {subtitle ? (
            <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {subtitle}
            </div>
          ) : null}

          <div className="mt-6 flex justify-center">
            <Button
              size="md"
              onClick={onNext}
              className="h-12 px-6 text-base"
            >
              Next Challenge
            </Button>
          </div>

          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Pro tip: brag to your group chat immediately.
          </div>
        </div>
      </div>
    </div>
  )
}

