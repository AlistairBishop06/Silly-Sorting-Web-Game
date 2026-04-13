import { Clock } from 'lucide-react'

function formatMmSs(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export default function TopBar({
  secondsLeft,
  roundSeconds,
  gameStarted,
}: {
  secondsLeft: number
  roundSeconds: number
  gameStarted: boolean
}) {
  const displaySeconds = gameStarted ? secondsLeft : roundSeconds
  const progress = gameStarted
    ? Math.max(0, Math.min(1, secondsLeft / Math.max(1, roundSeconds)))
    : 1
  const isUrgent = gameStarted && secondsLeft <= 15
  const pct = Math.round(progress * 100)

  return (
    <div className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:gap-6 sm:py-3.5">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 text-white shadow-pop sm:h-11 sm:w-11">
            <span className="text-xs font-black tracking-widest">SS</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold leading-tight sm:text-base">
              <span className="title-gradient">Silly Sort</span>
            </div>
            <div className="hidden text-xs text-zinc-400 sm:block">
              Weird rules. Real Python.
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={[
              'mx-auto w-full max-w-md rounded-2xl border-2 px-4 py-3 shadow-pop backdrop-blur-md transition-[box-shadow,transform] duration-300 sm:px-5 sm:py-3.5',
              'border-zinc-700/90 bg-zinc-900/70',
              isUrgent
                ? 'border-rose-500/70 shadow-[0_0_32px_rgba(244,63,94,0.25)] ring-2 ring-rose-400/30'
                : 'ring-1 ring-violet-400/10',
              isUrgent ? 'animate-pulse' : '',
            ].join(' ')}
            aria-label={
              gameStarted
                ? `Time left: ${displaySeconds} seconds, ${pct} percent`
                : 'Timer starts when you press START on the title screen'
            }
            title={gameStarted ? 'Time remaining this round' : 'Press START to begin'}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
                    isUrgent
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-violet-400/15 text-violet-300',
                  ].join(' ')}
                >
                  <Clock className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2.25} aria-hidden />
                </div>
                <div className="min-w-0">
                  <div
                    className={[
                      'text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px]',
                      isUrgent ? 'text-rose-300' : 'text-zinc-400',
                    ].join(' ')}
                  >
                    {gameStarted ? 'Time left' : 'Ready'}
                  </div>
                  <div
                    className={[
                      'font-mono text-2xl font-black tabular-nums leading-none tracking-tight sm:text-3xl',
                      isUrgent ? 'text-rose-200' : 'text-zinc-50',
                    ].join(' ')}
                  >
                    {formatMmSs(displaySeconds)}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[10px] font-semibold tabular-nums text-zinc-400 sm:text-xs">
                  {gameStarted ? `${pct}%` : '—'}
                </div>
                <div className="mt-0.5 text-[10px] font-medium text-zinc-500">
                  {gameStarted ? 'of round' : 'full'}
                </div>
              </div>
            </div>

            <div
              className={[
                'mt-3 h-2.5 w-full overflow-hidden rounded-full sm:h-3',
                isUrgent ? 'bg-rose-950/40' : 'bg-zinc-800/80',
              ].join(' ')}
            >
              <div
                className={[
                  'h-full rounded-full transition-[width] duration-300 ease-out',
                  isUrgent
                    ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 shadow-[0_0_14px_rgba(124,58,237,0.35)]',
                ].join(' ')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
