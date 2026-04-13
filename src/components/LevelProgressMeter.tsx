import { BOSS_LEVEL_EVERY, isBossStageLevel } from '../utils/sillySorts'

const WAVE = 10

export default function LevelProgressMeter({
  currentLevel,
  totalLevels,
  bossEvery = BOSS_LEVEL_EVERY,
}: {
  currentLevel: number
  totalLevels: number
  bossEvery?: number
}) {
  const safeTotal = Math.max(1, totalLevels)
  const clamped = Math.min(Math.max(1, currentLevel), safeTotal)
  const onBoss = isBossStageLevel(clamped, bossEvery)
  const rawNextBoss = Math.ceil((clamped + 1) / bossEvery) * bossEvery
  const nextBossMarker = rawNextBoss <= safeTotal ? rawNextBoss : bossEvery

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 flex justify-center px-3 pb-3 pt-6 sm:pb-4"
      aria-hidden
    >
      <div
        className={[
          'relative w-full max-w-3xl overflow-hidden rounded-2xl border shadow-[0_-8px_40px_rgba(0,0,0,0.12)]',
          onBoss
            ? 'border-rose-500/50 bg-gradient-to-b from-rose-950/90 via-zinc-950/95 to-rose-950/90 shadow-[0_-12px_48px_rgba(244,63,94,0.2)]'
            : 'border-amber-900/25 bg-gradient-to-b from-amber-950/40 via-amber-950/30 to-rose-950/35',
        ].join(' ')}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(180, 83, 9, 0.45) 1px, transparent 1px)',
            backgroundSize: '9px 9px',
          }}
        />
        {onBoss ? (
          <div
            className="boss-meter-pulse pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              background:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(244,63,94,0.4) 2px, rgba(244,63,94,0.4) 4px)',
            }}
          />
        ) : null}

        <div className="pointer-events-none absolute inset-y-2 left-0 w-3 rounded-r-full bg-gradient-to-r from-rose-950/50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-2 right-0 w-3 rounded-l-full bg-gradient-to-l from-rose-950/50 to-transparent" />

        <div className="relative flex items-center justify-between gap-2 px-3 py-3 sm:px-5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-pink-900/50 bg-gradient-to-br from-pink-950/60 to-zinc-900 text-lg shadow-sm"
            title="Start"
          >
            🏰
          </div>

          <div className="relative min-w-0 flex-1 px-0.5">
            <div className="pointer-events-none absolute left-0 right-0 top-[calc(50%-10px)] h-0.5 -translate-y-1/2 rounded-full bg-amber-800/50" />
            <div
              className="pointer-events-none absolute left-0 top-[calc(50%-10px)] h-0.5 -translate-y-1/2 rounded-full bg-teal-500/80 transition-all duration-500"
              style={{
                width:
                  safeTotal <= 1
                    ? '0%'
                    : `${(Math.max(0, clamped - 1) / Math.max(1, safeTotal - 1)) * 100}%`,
              }}
            />

            <div className="relative flex w-full items-start">
              {Array.from({ length: safeTotal }, (_, i) => {
                const n = i + 1
                const done = n < clamped
                const current = n === clamped
                const isBossNode = isBossStageLevel(n, bossEvery)
                const waveY = Math.sin(i * 0.65) * WAVE

                const bossDoneClasses =
                  'h-7 w-7 border-rose-400 bg-gradient-to-br from-rose-600 to-amber-700 text-[8px] text-white shadow-md shadow-rose-500/30 sm:h-8 sm:w-8 sm:text-[9px]'
                const bossCurrentClasses =
                  'h-9 w-9 border-2 border-rose-300 bg-gradient-to-b from-rose-500 to-amber-600 text-[9px] text-white shadow-[0_0_24px_rgba(244,63,94,0.7)] ring-2 ring-rose-400/60 sm:h-10 sm:w-10 sm:text-[10px]'
                const bossFutureClasses =
                  'h-5 w-5 border-rose-600/60 bg-rose-950/80 text-[0px] text-transparent sm:h-6 sm:w-6'

                const normalDoneClasses =
                  'h-6 w-6 border-teal-400 bg-teal-600 text-[9px] text-white shadow-sm sm:h-7 sm:w-7 sm:text-[10px]'
                const normalCurrentClasses =
                  'h-8 w-8 border-amber-200 bg-gradient-to-b from-amber-300 to-amber-500 text-[10px] text-amber-950 shadow-[0_0_20px_rgba(250,204,21,0.65)] sm:h-9 sm:w-9 sm:text-xs'
                const normalFutureClasses =
                  'h-4 w-4 border-amber-800/60 bg-amber-950/40 text-[0px] text-transparent sm:h-5 sm:w-5'

                let dotClass =
                  'flex items-center justify-center rounded-full border-2 font-bold tabular-nums transition-all duration-300'
                if (isBossNode) {
                  if (done) dotClass += ` ${bossDoneClasses}`
                  else if (current) dotClass += ` ${bossCurrentClasses}`
                  else dotClass += ` ${bossFutureClasses}`
                } else {
                  if (done) dotClass += ` ${normalDoneClasses}`
                  else if (current) dotClass += ` ${normalCurrentClasses}`
                  else dotClass += ` ${normalFutureClasses}`
                }

                return (
                  <div
                    key={n}
                    className="flex min-w-0 flex-1 flex-col items-center"
                    style={{ transform: `translateY(${waveY}px)` }}
                  >
                    <div className={dotClass} title={isBossNode ? `Boss — level ${n}` : `Level ${n}`}>
                      {isBossNode ? '👹' : done || current ? n : ''}
                    </div>
                    {current ? (
                      <span
                        className="mt-0.5 text-[9px] leading-none sm:text-[10px]"
                        title="You are here"
                      >
                        {onBoss ? '⚔️' : '🧑‍💻'}
                      </span>
                    ) : (
                      <span className="mt-0.5 h-3 sm:h-3.5" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-900/60 bg-gradient-to-br from-amber-900 to-rose-950 text-lg shadow-inner"
            title="Final gauntlet"
          >
            👹
          </div>
        </div>

        <div
          className={[
            'relative border-t px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest',
            onBoss
              ? 'border-rose-500/40 bg-rose-950/50 text-rose-100'
              : 'border-rose-950/30 bg-rose-950/25 text-amber-100/90',
          ].join(' ')}
        >
          {onBoss ? (
            <span className="text-rose-300">Boss level</span>
          ) : (
            <span>
              Level {clamped} / {safeTotal}
            </span>
          )}
          {!onBoss ? (
            <span className="mt-0.5 block text-[9px] font-semibold normal-case tracking-normal text-amber-200/70">
              Boss every {bossEvery} · next @ level {nextBossMarker}
            </span>
          ) : (
            <span className="mt-0.5 block text-[9px] font-semibold normal-case tracking-normal text-rose-200/80">
              Level {clamped} / {safeTotal} — harder rule pool
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
