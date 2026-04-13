import clsx from 'clsx'

export default function FeedbackBanner({
  kind,
  title,
  detail,
}: {
  kind: 'success' | 'error' | 'info'
  title: string
  detail?: string
}) {
  const styles =
    kind === 'success'
      ? 'border-emerald-200/70 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-100'
      : kind === 'error'
        ? 'border-rose-200/70 bg-rose-50/70 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/35 dark:text-rose-100'
        : 'border-zinc-200/70 bg-white/70 text-zinc-900 dark:border-zinc-800/70 dark:bg-zinc-950/35 dark:text-zinc-100'

  return (
    <div
      className={clsx(
        'shadow-pop rounded-2xl border p-3 text-sm backdrop-blur-md',
        kind === 'success'
          ? 'border-l-4 border-l-emerald-400'
          : kind === 'error'
            ? 'border-l-4 border-l-rose-400'
            : 'border-l-4 border-l-violet-400',
        styles,
      )}
    >
      <div className="font-semibold">{title}</div>
      {detail ? <div className="mt-1 opacity-90">{detail}</div> : null}
    </div>
  )
}
