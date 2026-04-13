/** Side curtain strips; default `fixed` for gameplay — pass `className` for overlay layering. */
export default function TheaterCurtains({ className = 'fixed inset-0 z-[5]' }: { className?: string }) {
  return (
    <div
      className={['pointer-events-none overflow-hidden', className].filter(Boolean).join(' ')}
      aria-hidden
    >
      <div
        className="absolute inset-y-0 left-0 w-[min(22vw,180px)] bg-gradient-to-r from-rose-950 via-rose-900 to-transparent opacity-95"
        style={{
          boxShadow: 'inset -24px 0 40px rgba(0,0,0,0.35)',
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[min(22vw,180px)] bg-gradient-to-l from-rose-950 via-rose-900 to-transparent opacity-95"
        style={{
          boxShadow: 'inset 24px 0 40px rgba(0,0,0,0.35)',
        }}
      />
      <div className="absolute left-0 right-0 top-0 h-10 bg-gradient-to-b from-rose-950/90 to-transparent" />
    </div>
  )
}
