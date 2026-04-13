import Editor from '@monaco-editor/react'

export default function CodeEditor({
  value,
  onChange,
  darkMode,
}: {
  value: string
  onChange: (next: string) => void
  darkMode: boolean
}) {
  // Monaco renders its own theme; we use `vs-dark` so it looks good in both modes.
  return (
    <div className="h-[420px] overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/70 shadow-lg shadow-violet-500/5 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/45 dark:shadow-violet-500/10">
      <Editor
        height="420px"
        defaultLanguage="python"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        theme={darkMode ? 'vs-dark' : 'vs-light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          lineNumbers: 'on',
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          tabSize: 4,
          automaticLayout: true,
        }}
      />
    </div>
  )
}
