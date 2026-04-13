import Editor from '@monaco-editor/react'
import clsx from 'clsx'

export default function CodeEditor({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (next: string) => void
  className?: string
}) {
  return (
    <div
      className={clsx(
        'flex min-h-[min(52vh,420px)] flex-1 flex-col overflow-hidden rounded-3xl border border-fuchsia-500/20 bg-zinc-950/50 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_28px_90px_-28px_rgba(217,70,239,0.25)] backdrop-blur-xl',
        'lg:min-h-0',
        className,
      )}
    >
      <div className="flex min-h-0 flex-1">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={value}
          onChange={(v) => onChange(v ?? '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            lineHeight: 22,
            padding: { top: 12, bottom: 12 },
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            tabSize: 4,
            automaticLayout: true,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderLineHighlight: 'line',
          }}
        />
      </div>
    </div>
  )
}
