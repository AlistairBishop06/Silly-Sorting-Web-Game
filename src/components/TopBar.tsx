import { Moon, Sun } from 'lucide-react'
import Button from './Button'

export default function TopBar({
  score,
  streak,
  multiplier,
  secondsLeft,
  roundSeconds,
  darkMode,
  onToggleDarkMode,
  onNextChallenge,
  canNext,
}: {
  score: number
  streak: number
  multiplier: number
  secondsLeft: number
  roundSeconds: number
  darkMode: boolean
  onToggleDarkMode: () => void
  onNextChallenge: () => void
  canNext: boolean
}) {
  const progress = Math.max(0, Math.min(1, secondsLeft / Math.max(1, roundSeconds)))
  const isUrgent = secondsLeft <= 15

  return (
    <div className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/40 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 text-white shadow-pop">
            <span className="text-xs font-black tracking-widest">SS</span>
          </div>
          <div>
            <div className="text-sm font-extrabold leading-5">
              <span className="title-gradient">Silly Sort</span>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Write weird code. Get weird points.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <div
              className={[
                'relative overflow-hidden rounded-2xl border px-4 py-2 shadow-pop backdrop-blur',
                'border-zinc-200/70 bg-white/70 dark:border-zinc-800/70 dark:bg-zinc-950/45',
                isUrgent
                  ? 'ring-2 ring-rose-400/50 dark:ring-rose-300/40'
                  : 'ring-1 ring-violet-400/20 dark:ring-violet-300/20',
                isUrgent ? 'animate-pulse' : '',
              ].join(' ')}
              aria-label={`Time left: ${secondsLeft} seconds`}
              title="Time remaining"
            >
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(124,58,237,0.14), rgba(217,70,239,0.12), rgba(34,211,238,0.12))',
                }}
              />
              <div className="relative">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Timer
                  </div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {secondsLeft}s
                  </div>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-800/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="sm:hidden">
            <div
              className={[
                'relative overflow-hidden rounded-2xl border px-3 py-2 text-xs shadow-pop backdrop-blur',
                'border-zinc-200/70 bg-white/70 dark:border-zinc-800/70 dark:bg-zinc-950/45',
                isUrgent ? 'ring-2 ring-rose-400/50' : 'ring-1 ring-violet-400/20',
              ].join(' ')}
              aria-label={`Time left: ${secondsLeft} seconds`}
              title="Time remaining"
            >
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(124,58,237,0.14), rgba(217,70,239,0.12), rgba(34,211,238,0.12))',
                }}
              />
              <div className="relative flex items-center gap-2">
                <div className="font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {secondsLeft}s
                </div>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-800/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pill">
            Score:{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {score}
            </span>{' '}
            <span className="text-zinc-500 dark:text-zinc-500">
              (x{multiplier}, streak {streak})
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Toggle dark mode"
            onClick={onToggleDarkMode}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={!canNext}
            onClick={onNextChallenge}
            title={canNext ? 'Next challenge' : 'Solve first'}
          >
            Next Challenge
          </Button>
        </div>
      </div>
    </div>
  )
}
