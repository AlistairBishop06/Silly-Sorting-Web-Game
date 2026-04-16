import { BarChart3, Code2, Skull, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import BarChart from '../components/BarChart'
import Button from '../components/Button'
import CodeEditor from '../components/CodeEditor'
import FeedbackBanner from '../components/FeedbackBanner'
import LevelProgressMeter from '../components/LevelProgressMeter'
import StartOverlay from '../components/StartOverlay'
import TheaterCurtains from '../components/TheaterCurtains'
import TopBar from '../components/TopBar'
import WinOverlay from '../components/WinOverlay'
import { defaultStarterCode } from '../utils/starterCode'
import { runSillySort } from '../utils/pyodideRunner'
import {
  BOSS_LEVEL_EVERY,
  getRandomSillySort,
  isBossStageLevel,
  pickSortForStage,
  validateSillySort,
  type SillySort,
} from '../utils/sillySorts'
import { generateNumbers } from '../utils/random'

type RunState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'done'; output: number[]; steps: number[][]; stdout: string }
  | { kind: 'error'; message: string; traceback?: string; stdout?: string }

const ROUND_SECONDS = 300
const HIDDEN_TESTS = 3
const LEVEL_CHUNK_SIZE = 16

export default function GamePage() {
  const [sort, setSort] = useState<SillySort>(() => getRandomSillySort())
  const [input, setInput] = useState<number[]>(() => generateNumbers(10))
  const [exampleInput, setExampleInput] = useState<number[]>(() => generateNumbers(10))
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

  const [gameStarted, setGameStarted] = useState(false)
  const [stageLevel, setStageLevel] = useState(1)
  const [levelPathSeed, setLevelPathSeed] = useState(1)

  const [roundEndsAt, setRoundEndsAt] = useState(() => Date.now() + ROUND_SECONDS * 1000)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [])
  const secondsLeft = gameStarted
    ? Math.max(0, Math.ceil((roundEndsAt - now) / 1000))
    : ROUND_SECONDS

  useEffect(() => {
    if (!gameStarted) return
    if (secondsLeft !== 0) return
    if (hasSolved) return
    setFeedback({
      kind: 'error',
      title: "Time's up",
      detail: 'Submit is disabled at 0:00. You can still Run Code to experiment.',
    })
  }, [gameStarted, secondsLeft, hasSolved])

  function handleStartGame() {
    setGameStarted(true)
    setStageLevel(1)
    setSort(pickSortForStage(1))
    setRoundEndsAt(Date.now() + ROUND_SECONDS * 1000)
    setLevelPathSeed(Math.floor(Math.random() * 2 ** 31))
  }

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
    if (!gameStarted) {
      setFeedback({
        kind: 'info',
        title: 'Not started yet',
        detail: 'Press START on the title screen to begin the round timer.',
      })
      return
    }

    if (submit && hasSolved) {
      setFeedback({
        kind: 'info',
        title: 'Already solved',
        detail: 'Use “Next Challenge” on the win screen to continue.',
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

    const unchanged =
      input.length === result.output.length &&
      input.every((v, i) => v === result.output[i])

    const okDisplayed = validateSillySort(sort, input, result.output)
    if (!okDisplayed) {
      setHasSolved(false)
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
      return
    }

    // Anti-cheat: verify the code works on extra unseen inputs too.
    for (let i = 0; i < HIDDEN_TESTS; i++) {
      const len = 6 + Math.floor(Math.random() * 7) // 6..12
      let hiddenInput = generateNumbers(len)
      if (hiddenInput.length === input.length && hiddenInput.every((v, idx) => v === input[idx])) {
        hiddenInput = generateNumbers(len)
      }
      const hidden = await runSillySort({ code, input: hiddenInput, timeoutMs: 800 })
      if (!hidden.ok) {
        setHasSolved(false)
        setFeedback({
          kind: 'error',
          title: '❌ Failed hidden tests',
          detail: `Your code errored on a hidden input. (${hidden.error})`,
        })
        return
      }
      const hiddenOk = validateSillySort(sort, hiddenInput, hidden.output)
      if (!hiddenOk) {
        setHasSolved(false)
        setFeedback({
          kind: 'error',
          title: '❌ Failed hidden tests',
          detail:
            'Your solution passed the displayed input check, but failed on a hidden input. Avoid hardcoding values and follow the rule in general.',
        })
        return
      }
    }

    const ok = validateSillySort(sort, input, result.output)
    if (ok) {
      setHasSolved(true)
      setFeedback({
        kind: 'success',
        title: '✅ Success',
        detail: `Expected output: ${sort.expectedOutput(input)}`,
      })
    } else {
      setHasSolved(false)
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
    const nextLevel = stageLevel + 1
    const next = generateNumbers(10)
    setStageLevel(nextLevel)
    setSort(pickSortForStage(nextLevel))
    setInput(next)
    initialInputRef.current = next
    setExampleInput(generateNumbers(10))
    setCode(defaultStarterCode)
    setRunState({ kind: 'idle' })
    setFeedback(null)
    setHasSolved(false)
    setRoundEndsAt(Date.now() + ROUND_SECONDS * 1000)
    setPlayStep(0)
    stopPlayback()
  }

  /** Fresh puzzle + full timer after a failed round; does not advance the level meter. */
  function newRoundFromFailure() {
    const next = generateNumbers(10)
    setSort(pickSortForStage(stageLevel))
    setInput(next)
    initialInputRef.current = next
    setExampleInput(generateNumbers(10))
    setCode(defaultStarterCode)
    setRunState({ kind: 'idle' })
    setFeedback(null)
    setHasSolved(false)
    setRoundEndsAt(Date.now() + ROUND_SECONDS * 1000)
    setPlayStep(0)
    stopPlayback()
  }

  const showNewRoundAfterFailure =
    gameStarted &&
    !hasSolved &&
    (feedback?.kind === 'error' || runState.kind === 'error')

  const isBossLevel = gameStarted && isBossStageLevel(stageLevel, BOSS_LEVEL_EVERY)

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <TheaterCurtains />

      {!gameStarted ? <StartOverlay onStart={handleStartGame} /> : null}

      <TopBar secondsLeft={secondsLeft} roundSeconds={ROUND_SECONDS} gameStarted={gameStarted} />

      {hasSolved ? (
        <WinOverlay
          title="You did the impossible."
          subtitle="Take the win. New nonsense awaits."
          onNext={nextChallenge}
        />
      ) : null}

      {isBossLevel ? (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-[8] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_55%,rgba(127,29,29,0.45)_100%)]"
            aria-hidden
          />
          <div
            className="boss-scanlines pointer-events-none fixed inset-0 z-[8] opacity-70 mix-blend-overlay"
            aria-hidden
          />
        </>
      ) : null}

      <main
        className={[
          'relative z-10 mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col gap-4 overflow-hidden px-3 pb-[10.5rem] pt-2 sm:gap-5 sm:px-5 sm:pb-40 sm:pt-3 lg:pb-36',
          isBossLevel
            ? 'boss-arena-glow rounded-none ring-2 ring-rose-500/50 ring-offset-2 ring-offset-zinc-950 lg:rounded-xl'
            : '',
        ].join(' ')}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden sm:gap-5 lg:flex-row lg:gap-6">
        {/* Left: live chart column */}
        <section className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto lg:min-w-0 lg:flex-[1.05] lg:pr-1">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/30 bg-gradient-to-br from-white/80 via-violet-50/50 to-fuchsia-100/60 p-[1px] shadow-[0_0_80px_-28px_rgba(139,92,246,0.55)] backdrop-blur-2xl dark:border-white/10 dark:from-zinc-950/95 dark:via-violet-950/50 dark:to-fuchsia-950/60 dark:shadow-[0_0_100px_-30px_rgba(168,85,247,0.35)]">
            <div className="flex h-full min-h-0 flex-col rounded-[1.7rem] bg-white/50 p-4 dark:bg-zinc-950/65 sm:p-5">
              <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
                    <BarChart3 className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                      Live
                    </div>
                    <h2 className="mt-2 text-lg font-black tracking-tight text-zinc-900 dark:text-white sm:text-xl">
                      Your array
                    </h2>
                    <p className="mt-0.5 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
                      Bars reorder and morph as your Python runs.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" className="rounded-xl font-semibold" onClick={resetNumbers}>
                    Reset
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-xl font-semibold"
                    onClick={generateNewNumbers}
                  >
                    New numbers
                  </Button>
                </div>
              </div>

              <div className="mt-4 min-h-0 flex-1 sm:mt-5">
                <BarChart values={activeArray} highlightIndices={highlightIndices} />
              </div>

              {runState.kind === 'done' && runState.steps.length > 1 ? (
                <div className="mt-4 shrink-0 rounded-2xl border border-violet-500/15 bg-violet-500/[0.06] p-3 text-xs text-zinc-700 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/[0.08] dark:text-zinc-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-zinc-900 dark:text-white">Playback</span>
                    <span className="tabular-nums font-semibold text-violet-700 dark:text-fuchsia-300">
                      {playStep + 1} / {runState.steps.length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setPlayStep((s) => Math.max(0, s - 1))}
                      disabled={playStep <= 0}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setPlayStep((s) => Math.min(runState.steps.length - 1, s + 1))}
                      disabled={playStep >= runState.steps.length - 1}
                    >
                      Next
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => {
                        if (runState.kind !== 'done') return
                        if (isPlaying) stopPlayback()
                        else startPlayback(runState.steps.length)
                      }}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <input
                      className="h-2 min-w-[120px] flex-1 cursor-pointer accent-fuchsia-600"
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
          </div>

          {feedback ? (
            <FeedbackBanner kind={feedback.kind} title={feedback.title} detail={feedback.detail} />
          ) : null}

          {runState.kind === 'done' && runState.stdout.trim().length > 0 ? (
            <div className="shrink-0 rounded-2xl border border-zinc-200/80 bg-zinc-900/[0.03] p-4 text-xs text-zinc-700 backdrop-blur-md dark:border-zinc-700/80 dark:bg-white/[0.04] dark:text-zinc-300">
              <div className="mb-2 text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                stdout
              </div>
              <pre className="max-h-36 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed scrollbar-thin sm:max-h-44 sm:text-xs">
                {runState.stdout}
              </pre>
            </div>
          ) : null}
        </section>

        {/* Right: challenge + editor */}
        <section className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden lg:min-w-0 lg:flex-[1] lg:pl-1">
          <div
            className={[
              'relative shrink-0 overflow-hidden rounded-[1.75rem] border p-5 sm:p-6',
              isBossLevel
                ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/90 via-red-950/60 to-zinc-950 shadow-[0_0_80px_-16px_rgba(244,63,94,0.45)]'
                : 'border-violet-500/20 bg-gradient-to-br from-violet-500/[0.18] via-fuchsia-500/[0.12] to-cyan-500/[0.1] shadow-[0_0_70px_-24px_rgba(168,85,247,0.3)]',
            ].join(' ')}
          >
            <div
              className={[
                'pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl',
                isBossLevel
                  ? 'bg-gradient-to-br from-rose-600/40 to-red-900/30'
                  : 'bg-gradient-to-br from-fuchsia-500/30 to-violet-600/20',
              ].join(' ')}
              aria-hidden
            />
            {isBossLevel ? (
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(244,63,94,0.15) 12px, rgba(244,63,94,0.15) 14px)',
                }}
                aria-hidden
              />
            ) : null}
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                {isBossLevel ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/50 bg-gradient-to-r from-rose-600 to-amber-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-rose-500/30">
                    <Skull className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    Boss level
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-zinc-950/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-200 backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    Challenge
                  </div>
                )}
                <h2 className="mt-3 text-2xl font-black leading-[1.1] tracking-tight text-zinc-950 sm:text-3xl sm:leading-tight dark:text-white">
                  <span className="title-gradient bg-[length:120%_auto]">{sort.name}</span>
                </h2>
                <p className="mt-3 text-base leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-[1.05rem]">
                  {sort.description}
                </p>
                <div className="mt-5 rounded-2xl border border-zinc-200/80 bg-zinc-950/[0.04] p-4 dark:border-zinc-600/50 dark:bg-black/35">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    Example I/O
                  </div>
                  <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-zinc-800 dark:text-zinc-100 sm:text-[13px]">
                    <span className="text-fuchsia-600 dark:text-fuchsia-400">in</span> [{exampleInput.join(', ')}]
                    {'\n'}
                    <span className="text-cyan-600 dark:text-cyan-400">out</span> {sort.expectedOutput(exampleInput)}
                  </pre>
                </div>
                {forbidUnchangedForThisInput ? (
                  <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-950 dark:text-amber-100">
                    Output must not equal the input for this round.
                  </div>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 rounded-xl border border-zinc-200/80 bg-white/50 font-bold dark:border-zinc-700 dark:bg-zinc-900/50"
                onClick={() => setCode(defaultStarterCode)}
              >
                Reset code
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 lg:min-h-0">
            <div className="flex shrink-0 items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/20">
                <Code2 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Editor
                </div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Python · Pyodide</div>
              </div>
            </div>

            <CodeEditor value={code} onChange={setCode} />

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="h-11 min-w-[7rem] rounded-2xl px-5 text-base font-bold"
                  onClick={() => void handleRun({ submit: false })}
                  disabled={!gameStarted || runState.kind === 'running'}
                >
                  Run
                </Button>
                <Button
                  className="h-11 min-w-[9rem] rounded-2xl px-6 text-base font-black shadow-[0_12px_40px_-8px_rgba(124,58,237,0.55)]"
                  onClick={() => void handleRun({ submit: true })}
                  disabled={
                    !gameStarted || runState.kind === 'running' || secondsLeft === 0 || hasSolved
                  }
                >
                  Submit
                </Button>
              </div>
              <div className="flex min-w-0 flex-1 items-center sm:justify-end">
                <span className="inline-flex max-w-full truncate rounded-2xl border border-zinc-200/80 bg-white/70 px-3 py-2 font-mono text-[11px] font-medium text-zinc-800 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200 sm:text-xs">
                  [{input.join(', ')}]
                </span>
              </div>
            </div>
          </div>

        </section>
        </div>

        {showNewRoundAfterFailure ? (
          <div className="flex w-full flex-col items-center gap-2 border-t border-zinc-200/50 pt-4 dark:border-zinc-800/50 lg:shrink-0 lg:border-t-0 lg:pt-0">
            <Button
              variant="secondary"
              className="min-w-[12rem] rounded-2xl border-rose-900/20 bg-rose-950/10 font-bold text-rose-950 shadow-md hover:bg-rose-950/15 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/15"
              onClick={newRoundFromFailure}
            >
              New round
            </Button>
            <p className="max-w-md text-center text-xs text-zinc-600 dark:text-zinc-400">
              New prompt, new numbers, and a full timer. Your place on the level path stays the same.
            </p>
          </div>
        ) : null}
      </main>

      {gameStarted ? (
        <LevelProgressMeter
          currentLevel={stageLevel}
          bossEvery={BOSS_LEVEL_EVERY}
          chunkSize={LEVEL_CHUNK_SIZE}
          seed={levelPathSeed}
        />
      ) : null}
    </div>
  )
}
