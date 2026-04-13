import { Clock, Sparkles } from 'lucide-react'

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
      <div className="mx-auto flex max-w-[1920px] items-center gap-4 px-4 py-3 sm:gap-6 sm:px-5 sm:py-3.5">
        <a
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-3 rounded-2xl pr-2 outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-fuchsia-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          aria-label="Silly Sort — home"
        >
          <div
            className="relative flex h-11 w-11 shrink-0 flex-col items-center justify-end gap-0 rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 p-1.5 shadow-[0_10px_40px_-8px_rgba(139,92,246,0.65),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/15 sm:h-12 sm:w-12"
            aria-hidden
          >
            <div className="flex h-full w-full items-end justify-center gap-1 px-0.5 pb-0.5 pt-1">
              <span className="h-2 w-1.5 rounded-sm bg-white/75 shadow-sm transition-transform duration-300 group-hover:scale-y-110 sm:h-2.5" />
              <span className="h-3 w-1.5 rounded-sm bg-white/90 shadow-sm transition-transform duration-300 group-hover:scale-y-110 sm:h-3.5" />
              <span className="h-[18px] w-1.5 rounded-sm bg-white shadow-sm transition-transform duration-300 group-hover:scale-y-110 sm:h-5" />
            </div>
            <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-md bg-zinc-950/90 shadow-md ring-1 ring-fuchsia-400/40">
              <Sparkles className="h-2.5 w-2.5 text-amber-200" strokeWidth={2.5} aria-hidden />
            </span>
          </div>
          <div className="min-w-0 text-left">
            <h1 className="truncate font-black leading-[1.05] tracking-tight">
              <span className="title-gradient text-[1.05rem] sm:text-xl">Silly Sort</span>
            </h1>
            <div className="mt-1 h-0.5 w-12 max-w-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 opacity-90 sm:w-14" />
            <p className="mt-1.5 hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 sm:block">
              Weird rules · Real Python
            </p>
          </div>
        </a>

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
