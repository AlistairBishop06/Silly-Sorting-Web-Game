import { type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

const base =
  'focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 active:translate-y-px'

const variants: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'shadow-pop bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 text-white hover:brightness-110',
  secondary:
    'bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white',
  ghost:
    'bg-white/40 text-zinc-900 shadow-sm hover:bg-white/70 hover:shadow-md dark:bg-zinc-950/30 dark:text-zinc-100 dark:hover:bg-zinc-950/60 dark:hover:shadow-zinc-950/30',
  danger:
    'bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-pop hover:brightness-110',
}

const sizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}
