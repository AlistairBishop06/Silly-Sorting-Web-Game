import TheaterCurtains from './TheaterCurtains'

export default function StartOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-overlay-title"
    >
      {/* Stage depth */}
      <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-md" />

      {/* Curtains above the dim so the red bars stay visible (same look as in-game) */}
      <TheaterCurtains className="absolute inset-0 z-[1]" />

      {/* Spotlight + warm stage */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 38%, rgba(250, 204, 21, 0.22), transparent 65%), radial-gradient(ellipse 90% 60% at 50% 100%, rgba(168, 85, 247, 0.12), transparent 55%)',
        }}
      />

      {/* Floating pixels */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { l: '12%', t: '18%', d: 2.4, s: 0.9 },
          { l: '78%', t: '22%', d: 3.1, s: 1.1 },
          { l: '64%', t: '58%', d: 2.8, s: 0.85 },
          { l: '28%', t: '62%', d: 3.4, s: 1.05 },
          { l: '48%', t: '14%', d: 2.2, s: 0.75 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute h-2 w-2 rounded-sm bg-cyan-300/40 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
            style={{
              left: p.l,
              top: p.t,
              animation: `sillyFloat ${p.d}s ease-in-out infinite`,
              animationDelay: `${p.s}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-4 w-full max-w-lg">
        <div className="relative overflow-hidden rounded-3xl border border-rose-900/40 bg-gradient-to-b from-amber-100/95 via-amber-50/90 to-amber-100/85 p-1 shadow-[0_24px_80px_rgba(0,0,0,0.45)] dark:from-zinc-900/95 dark:via-zinc-950/90 dark:to-zinc-900/95 dark:border-rose-950/50">
          <div
            className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(180,83,9,0.35) 1px, transparent 1px)',
              backgroundSize: '10px 10px',
            }}
          />
          <div className="relative rounded-[1.35rem] border border-amber-200/80 bg-white/55 px-6 py-8 text-center backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-950/50">
            <div className="mx-auto inline-flex rounded-full border border-violet-300/50 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-800 dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-violet-200">
              Stage ready
            </div>

            <h1
              id="start-overlay-title"
              className="start-arcade mt-4 text-lg leading-relaxed text-rose-950 sm:text-xl dark:text-amber-100"
            >
              SILLY SORT
              <span className="mt-2 block text-[11px] text-amber-900/90 dark:text-amber-200/90">
                CHALLENGE
              </span>
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              You&apos;ll get a nonsense sorting rule, a live bar chart, and a timer. When you hit{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">START</span>, the clock
              begins — then read, code, run, and submit.
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onStart}
                className="start-pulse group relative inline-flex items-center justify-center rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-300 to-amber-500 px-10 py-4 text-sm font-black uppercase tracking-widest text-amber-950 transition hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 dark:border-amber-300/50 dark:from-amber-200 dark:to-amber-400 dark:text-amber-950"
              >
                <span className="relative z-10 drop-shadow-sm">Start</span>
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100"
                  style={{
                    boxShadow: 'inset 0 0 40px rgba(255,255,255,0.35)',
                  }}
                />
              </button>
            </div>

            <div className="mt-5 text-xs text-zinc-500 dark:text-zinc-400">
              Tip: mutating <code className="text-zinc-800 dark:text-zinc-200">arr</code> in place helps
              the visualisation.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
