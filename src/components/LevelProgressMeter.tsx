import { useMemo } from 'react'
import { BOSS_LEVEL_EVERY, isBossStageLevel } from '../utils/sillySorts'
import { MUTATOR_LEVEL_EVERY, isMutatorStageLevel } from '../utils/stages'
import { mulberry32 } from '../utils/prng'

const STEP_Y = 6

function generateChunkYs({
  seed,
  chunkIndex,
  chunkSize,
  startY,
  minY = -2,
  maxY = 2,
}: {
  seed: number
  chunkIndex: number
  chunkSize: number
  startY: number
  minY?: number
  maxY?: number
}) {
  const rng = mulberry32((seed ^ (chunkIndex * 0x9e3779b9)) >>> 0)
  const ys: number[] = new Array(chunkSize)
  let y = startY
  for (let i = 0; i < chunkSize; i++) {
    const r = rng()
    const delta = r < 0.25 ? -1 : r < 0.75 ? 0 : 1
    y = Math.max(minY, Math.min(maxY, y + delta))
    ys[i] = y
  }
  return { ys, endY: y }
}

export default function LevelProgressMeter({
  currentLevel,
  bossEvery = BOSS_LEVEL_EVERY,
  mutatorEvery = MUTATOR_LEVEL_EVERY,
  chunkSize = 16,
  seed,
}: {
  currentLevel: number
  bossEvery?: number
  mutatorEvery?: number
  chunkSize?: number
  seed: number
}) {
  const safeChunk = Math.max(1, Math.floor(chunkSize))
  const clamped = Math.max(1, Math.floor(currentLevel))
  const onBoss = isBossStageLevel(clamped, bossEvery)
  const onMutator = isMutatorStageLevel(clamped, mutatorEvery, bossEvery)

  const chunkIndex = Math.floor((clamped - 1) / safeChunk)
  const chunkStart = chunkIndex * safeChunk + 1
  const chunkEnd = chunkStart + safeChunk - 1
  const nextChunkStart = chunkEnd + 1

  const { startY, chunkYs } = useMemo(() => {
    // Walk forward chunk-by-chunk to keep the vertical path continuous.
    let curStartY = 0
    for (let i = 0; i < chunkIndex; i++) {
      const prev = generateChunkYs({
        seed,
        chunkIndex: i,
        chunkSize: safeChunk,
        startY: curStartY,
      })
      curStartY = prev.endY
    }
    const ys = generateChunkYs({
      seed,
      chunkIndex,
      chunkSize: safeChunk,
      startY: curStartY,
    }).ys
    return { startY: curStartY, chunkYs: ys }
  }, [chunkIndex, safeChunk, seed])

  const visibleLevels: number[] = chunkIndex > 0 ? [chunkStart - 1] : []
  for (let i = 0; i < safeChunk; i++) visibleLevels.push(chunkStart + i)

  const rawNextBoss = Math.ceil((clamped + 1) / bossEvery) * bossEvery
  const nextBossMarker = rawNextBoss

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
            : onMutator
              ? 'border-emerald-400/50 bg-gradient-to-b from-emerald-950/70 via-zinc-950/90 to-emerald-950/70 shadow-[0_-12px_48px_rgba(16,185,129,0.18)]'
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
                width: `${(Math.max(0, clamped - chunkStart) / Math.max(1, safeChunk - 1)) * 100}%`,
              }}
            />

            <div className="relative flex w-full items-start">
              {visibleLevels.map((level) => {
                const done = level < clamped
                const current = level === clamped
                const isBossNode = isBossStageLevel(level, bossEvery)
                const isMutatorNode = isMutatorStageLevel(level, mutatorEvery, bossEvery)

                const y =
                  level === chunkStart - 1
                    ? startY * STEP_Y
                    : chunkYs[Math.max(0, level - chunkStart)]! * STEP_Y

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

                const mutatorDoneClasses =
                  'h-6 w-6 border-emerald-300 bg-emerald-500 text-[9px] text-emerald-950 shadow-sm shadow-emerald-500/15 sm:h-7 sm:w-7 sm:text-[10px]'
                const mutatorCurrentClasses =
                  'h-8 w-8 border-2 border-emerald-200 bg-gradient-to-b from-emerald-300 to-emerald-500 text-[10px] text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/40 sm:h-9 sm:w-9 sm:text-xs'
                const mutatorFutureClasses =
                  'h-4 w-4 border-emerald-700/60 bg-emerald-950/35 text-[0px] text-transparent sm:h-5 sm:w-5'

                let dotClass =
                  'flex items-center justify-center rounded-full border-2 font-bold tabular-nums transition-all duration-300'
                if (level === chunkStart - 1) {
                  dotClass +=
                    ' h-4 w-4 border-zinc-700/70 bg-zinc-950/40 text-[0px] text-transparent opacity-60 sm:h-5 sm:w-5'
                } else if (isBossNode) {
                  if (done) dotClass += ` ${bossDoneClasses}`
                  else if (current) dotClass += ` ${bossCurrentClasses}`
                  else dotClass += ` ${bossFutureClasses}`
                } else if (isMutatorNode) {
                  if (done) dotClass += ` ${mutatorDoneClasses}`
                  else if (current) dotClass += ` ${mutatorCurrentClasses}`
                  else dotClass += ` ${mutatorFutureClasses}`
                } else {
                  if (done) dotClass += ` ${normalDoneClasses}`
                  else if (current) dotClass += ` ${normalCurrentClasses}`
                  else dotClass += ` ${normalFutureClasses}`
                }

                return (
                  <div
                    key={level}
                    className="flex min-w-0 flex-1 flex-col items-center"
                    style={{ transform: `translateY(${y}px)` }}
                  >
                    <div
                      className={dotClass}
                      title={
                        level === chunkStart - 1
                          ? `Previous chunk — level ${level}`
                          : isBossNode
                            ? `Boss — level ${level}`
                            : `Level ${level}`
                      }
                    >
                      {level === chunkStart - 1
                        ? ''
                        : isBossNode
                          ? '👹'
                          : isMutatorNode
                            ? current
                              ? '🧬'
                              : ''
                          : done || current
                            ? level
                            : ''}
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
            ➡️
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
          ) : onMutator ? (
            <span className="text-emerald-300">Mutator stage</span>
          ) : (
            <span>Level {clamped}</span>
          )}
          {!onBoss ? (
            <span
              className={[
                'mt-0.5 block text-[9px] font-semibold normal-case tracking-normal',
                onMutator ? 'text-emerald-200/75' : 'text-amber-200/70',
              ].join(' ')}
            >
              Chunk {chunkIndex + 1} ({chunkStart}–{chunkEnd}) · next chunk @ level {nextChunkStart} · next boss
              @ level {nextBossMarker}
            </span>
          ) : (
            <span className="mt-0.5 block text-[9px] font-semibold normal-case tracking-normal text-rose-200/80">
              Chunk {chunkIndex + 1} ({chunkStart}–{chunkEnd}) — harder rule pool
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
