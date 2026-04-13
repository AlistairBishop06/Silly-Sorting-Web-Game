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
      ? 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100'
      : kind === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100'
        : 'border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'

  return (
    <div className={clsx('rounded-xl border p-3 text-sm', styles)}>
      <div className="font-semibold">{title}</div>
      {detail ? <div className="mt-1 opacity-90">{detail}</div> : null}
    </div>
  )
}

