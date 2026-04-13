import { useEffect, useMemo, useRef, useState } from 'react'
import BarChart from '../components/BarChart'
import Button from '../components/Button'
import CodeEditor from '../components/CodeEditor'
import FeedbackBanner from '../components/FeedbackBanner'
import TopBar from '../components/TopBar'
import WinOverlay from '../components/WinOverlay'
import { defaultStarterCode } from '../utils/starterCode'
import { runSillySort } from '../utils/pyodideRunner'
import { getRandomSillySort, validateSillySort, type SillySort } from '../utils/sillySorts'
import { generateNumbers } from '../utils/random'
import { getStoredBoolean, setStoredBoolean } from '../utils/storage'

type RunState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'done'; output: number[]; steps: number[][]; stdout: string }
  | { kind: 'error'; message: string; traceback?: string; stdout?: string }

const ROUND_SECONDS = 300

export default function GamePage() {
  const [darkMode, setDarkMode] = useState(() => getStoredBoolean('silly_sort_dark', false))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    setStoredBoolean('silly_sort_dark', darkMode)
  }, [darkMode])

  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const multiplier = 1 + Math.floor(streak / 3)

  const [sort, setSort] = useState<SillySort>(() => getRandomSillySort())
  const [input, setInput] = useState<number[]>(() => generateNumbers(10))
  const initialInputRef = useRef<number[]>(input)

  const [code, setCode] = useState<string>(() => defaultStarterCode)
  const [runState, setRunState] = useState<RunState>({ kind: 'idle' })
  const [playStep, setPlayStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playTimer = useRef<number | null>(null)
  useEffect(() => {
    return () => {
      if (playTimer.current) window.clearInterval(playTimer.current)
    }
  }, [])
  const [feedback, setFeedback] = useState<
    null | { kind: 'success' | 'error' | 'info'; title: string; detail?: string }
  >(null)
  const [hasSolved, setHasSolved] = useState(false)

  const [roundEndsAt, setRoundEndsAt] = useState(() => Date.now() + ROUND_SECONDS * 1000)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [])
  const secondsLeft = Math.max(0, Math.ceil((roundEndsAt - now) / 1000))

  useEffect(() => {
    if (secondsLeft !== 0) return
    if (hasSolved) return
    setFeedback({
      kind: 'error',
      title: "Time's up",
      detail: 'Streak reset. Hit Run to try again, or Next Challenge to move on.',
    })
    setStreak(0)
  }, [secondsLeft, hasSolved])

  const activeArray = useMemo(() => {
    if (runState.kind === 'done') {
      if (runState.steps.length > 0) {
        const idx = Math.max(0, Math.min(runState.steps.length - 1, playStep))
        return runState.steps[idx]
      }
      return runState.output
    }
    return input
  }, [input, playStep, runState])

  const highlightIndices = useMemo(() => {
    if (runState.kind !== 'done') return undefined
    if (runState.steps.length < 2) return undefined
    const idx = Math.max(0, Math.min(runState.steps.length - 1, playStep))
    const prev = runState.steps[Math.max(0, idx - 1)]
    const cur = runState.steps[idx]
    const hot: number[] = []
    const n = Math.min(prev.length, cur.length)
    for (let i = 0; i < n; i++) if (prev[i] !== cur[i]) hot.push(i)
    return hot
  }, [playStep, runState])

  const forbidUnchangedForThisInput = useMemo(() => {
    if (!sort.cannotBeInput) return false
    return typeof sort.cannotBeInput === 'function'
      ? sort.cannotBeInput(input)
      : true
  }, [input, sort])

  function stopPlayback() {
    if (playTimer.current) {
      window.clearInterval(playTimer.current)
      playTimer.current = null
    }
    setIsPlaying(false)
  }

  function startPlayback(stepsLength: number) {
    stopPlayback()
    if (stepsLength <= 1) return
    setIsPlaying(true)
    playTimer.current = window.setInterval(() => {
      setPlayStep((s) => {
        const next = s + 1
        if (next >= stepsLength) {
          stopPlayback()
          return Math.max(0, stepsLength - 1)
        }
        return next
      })
    }, 350)
  }

  async function handleRun({ submit }: { submit: boolean }) {
    if (submit && hasSolved) {
      setFeedback({
        kind: 'info',
        title: 'Already solved',
        detail: 'Hit “Next Challenge” to earn more points.',
      })
      return
    }

    setFeedback(null)
    setRunState({ kind: 'running' })
    setPlayStep(0)
    stopPlayback()

    const result = await runSillySort({ code, input, timeoutMs: 800 })

    if (!result.ok) {
      setRunState({ kind: 'error', message: result.error, traceback: result.traceback, stdout: result.stdout })
      setFeedback({
        kind: 'error',
        title: 'Python crashed (completely normal behavior)',
        detail: result.error,
      })
      return
    }

    let steps = result.steps
    const outputDiffers =
      input.length !== result.output.length ||
      input.some((v, i) => v !== result.output[i])
    if (steps.length <= 1 && outputDiffers) steps = [input, result.output]

    setRunState({ kind: 'done', output: result.output, steps, stdout: result.stdout })

    if (submit) {
      setPlayStep(Math.max(0, steps.length - 1))
    } else {
      // For "Run Code", autoplay the captured steps from the start.
      setPlayStep(0)
      startPlayback(steps.length)
    }

    if (!submit) {
      setFeedback({
        kind: 'info',
        title: 'Ran your code',
        detail: result.stdout.trim().length > 0 ? 'Scroll down for stdout.' : 'No stdout. Stoic.',
      })
      return
    }

    const ok = validateSillySort(sort, input, result.output)
    const unchanged =
      input.length === result.output.length &&
      input.every((v, i) => v === result.output[i])
    if (ok) {
      setHasSolved(true)
      setScore((s) => s + 1 * multiplier)
      setStreak((st) => st + 1)
      setFeedback({
        kind: 'success',
        title: '✅ Success',
        detail: `Expected output: ${sort.expectedOutput(input)}`,
      })
    } else {
      setHasSolved(false)
      setStreak(0)
      setFeedback({
        kind: 'error',
        title: '❌ Rule violated',
        detail:
          forbidUnchangedForThisInput && unchanged
            ? `This prompt requires output to NOT equal the input. Expected output: ${sort.expectedOutput(
                input,
              )} | Got unchanged input.`
            : `Expected output: ${sort.expectedOutput(input)} | Got: [${result.output.join(', ')}]`,
      })
    }
  }

  function resetNumbers() {
    setInput([...initialInputRef.current])
    setRunState({ kind: 'idle' })
    setFeedback(null)
    setPlayStep(0)
    stopPlayback()
  }

  function generateNewNumbers() {
    const next = generateNumbers(10)
    setInput(next)
    initialInputRef.current = next
    setRunState({ kind: 'idle' })
    setFeedback(null)
    setPlayStep(0)
    stopPlayback()
  }

  function nextChallenge() {
    const next = generateNumbers(10)
    setSort(getRandomSillySort())
    setInput(next)
    initialInputRef.current = next
    setCode(defaultStarterCode)
    setRunState({ kind: 'idle' })
    setFeedback(null)
    setHasSolved(false)
    setRoundEndsAt(Date.now() + ROUND_SECONDS * 1000)
    setPlayStep(0)
    stopPlayback()
  }

  return (
    <div className="min-h-full">
      <TopBar
        score={score}
        streak={streak}
        multiplier={multiplier}
        secondsLeft={secondsLeft}
        roundSeconds={ROUND_SECONDS}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onNextChallenge={nextChallenge}
        canNext={hasSolved}
      />

      {hasSolved ? (
        <WinOverlay
          title="You did the impossible."
          subtitle="Take the win. New nonsense awaits."
          onNext={nextChallenge}
        />
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Visualisation
                  </div>
                  <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                    Bars animate as your code mangles the list.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={resetNumbers}>
                    Reset
                  </Button>
                  <Button variant="secondary" size="sm" onClick={generateNewNumbers}>
                    Generate New Numbers
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <BarChart values={activeArray} highlightIndices={highlightIndices} />
              </div>

              {runState.kind === 'done' && runState.steps.length > 1 ? (
                <div className="card-soft mt-4 p-3 text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">Playback</div>
                    <div className="tabular-nums">
                      Step {playStep + 1} / {runState.steps.length}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlayStep((s) => Math.max(0, s - 1))}
                      disabled={playStep <= 0}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlayStep((s) => Math.min(runState.steps.length - 1, s + 1))}
                      disabled={playStep >= runState.steps.length - 1}
                    >
                      Next
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (runState.kind !== 'done') return
                        if (isPlaying) stopPlayback()
                        else startPlayback(runState.steps.length)
                      }}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <input
                      className="h-2 w-full cursor-pointer accent-violet-600"
                      type="range"
                      min={0}
                      max={runState.steps.length - 1}
                      value={playStep}
                      onChange={(e) => setPlayStep(Number(e.target.value))}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {feedback ? (
              <FeedbackBanner kind={feedback.kind} title={feedback.title} detail={feedback.detail} />
            ) : null}

            {runState.kind === 'done' && runState.stdout.trim().length > 0 ? (
              <div className="card-soft p-3 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">stdout</div>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap scrollbar-thin">{runState.stdout}</pre>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    This round's prompt
                  </div>
                  <div className="mt-1 text-lg font-extrabold">
                    <span className="title-gradient">{sort.name}</span>
                  </div>
                  <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{sort.description}</div>
                  <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    An Example of an Expected output
                  </div>
                  <pre className="mt-1 overflow-auto rounded-lg border border-zinc-200/70 bg-white/60 px-3 py-2 text-xs text-zinc-800 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/40 dark:text-zinc-200">
                    {sort.expectedOutput(input)}
                  </pre>
                  {forbidUnchangedForThisInput ? (
                    <div className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300">
                      Rule twist: output must not be identical to the input.
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setCode(defaultStarterCode)}>
                    Reset Code
                  </Button>
                </div>
              </div>
            </div>

            <CodeEditor value={code} onChange={setCode} darkMode={darkMode} />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => void handleRun({ submit: false })}
                disabled={runState.kind === 'running'}
              >
                Run Code
              </Button>
              <Button
                onClick={() => void handleRun({ submit: true })}
                disabled={runState.kind === 'running' || secondsLeft === 0 || hasSolved}
              >
                Submit Solution
              </Button>

              <div className="ml-auto flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="pill">
                  Input: {input.join(', ')}
                </span>
              </div>
            </div>

            <div className="card-soft p-3 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">Execution notes</div>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>Runs in your browser using Pyodide (no server). Timeout: ~0.8s.</li>
                <li>Imports are disabled; use plain Python and return a list.</li>
                <li>
                  Mutating <code className="text-zinc-900 dark:text-zinc-100">arr</code> in place is best — we try to
                  record steps.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-500">
          Tip: Add a <code>print(arr)</code> while debugging. Remove it for style points (which are imaginary).
        </div>
      </div>
    </div>
  )
}
