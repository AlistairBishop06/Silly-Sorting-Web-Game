import { Moon, Sun } from 'lucide-react'
import Button from './Button'

export default function TopBar({
  score,
  streak,
  multiplier,
  secondsLeft,
  darkMode,
  onToggleDarkMode,
  onNextChallenge,
  canNext,
}: {
  score: number
  streak: number
  multiplier: number
  secondsLeft: number
  darkMode: boolean
  onToggleDarkMode: () => void
  onNextChallenge: () => void
  canNext: boolean
}) {
  return (
    <div className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white dark:bg-violet-500">
            SS
          </div>
          <div>
            <div className="text-sm font-semibold leading-5">Silly Sort</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Write weird code. Get weird points.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 sm:block">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {secondsLeft}s
            </span>{' '}
            left
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
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

