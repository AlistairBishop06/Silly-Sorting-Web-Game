type PyRunOk = { ok: true; output: number[]; steps: number[][]; stdout: string }
type PyRunErr = { ok: false; error: string; traceback?: string; stdout: string }
type PyRunResult = PyRunOk | PyRunErr

type LoadPyodideFn = (opts: { indexURL: string }) => Promise<any>

declare global {
  interface Window {
    loadPyodide?: LoadPyodideFn
  }
}

const PYODIDE_VERSION = 'v0.25.1'
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`
const PYODIDE_JS_URL = `${PYODIDE_BASE_URL}pyodide.js`

let pyodidePromise: Promise<any> | null = null

function loadScript(url: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`)
    if (existing) return resolve()
    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${url}`))
    document.head.appendChild(script)
  })
}

const PY_PRELUDE = `
import sys, io, traceback

class TraceList(list):
    def __init__(self, it):
        super().__init__(it)
        self._steps = [list(self)]

    def _snap(self):
        self._steps.append(list(self))

    def __setitem__(self, k, v):
        super().__setitem__(k, v)
        self._snap()

    def __delitem__(self, k):
        super().__delitem__(k)
        self._snap()

    def append(self, v):
        super().append(v)
        self._snap()

    def extend(self, it):
        super().extend(it)
        self._snap()

    def insert(self, i, v):
        super().insert(i, v)
        self._snap()

    def pop(self, i=-1):
        v = super().pop(i)
        self._snap()
        return v

    def remove(self, v):
        super().remove(v)
        self._snap()

    def clear(self):
        super().clear()
        self._snap()

    def reverse(self):
        super().reverse()
        self._snap()

    def sort(self, *args, **kwargs):
        super().sort(*args, **kwargs)
        self._snap()

    def steps(self):
        return self._steps

SAFE_BUILTINS = {
    "abs": abs,
    "all": all,
    "any": any,
    "bool": bool,
    "Exception": Exception,
    "ValueError": ValueError,
    "TypeError": TypeError,
    "enumerate": enumerate,
    "float": float,
    "int": int,
    "len": len,
    "list": list,
    "max": max,
    "min": min,
    "print": print,
    "range": range,
    "reversed": reversed,
    "round": round,
    "sorted": sorted,
    "sum": sum,
    "zip": zip,
}

def run_user(code, input_arr):
    stdout = io.StringIO()
    old = sys.stdout
    sys.stdout = stdout
    try:
        g = {"__builtins__": SAFE_BUILTINS}
        l = {}
        exec(code, g, l)
        fn = l.get("silly_sort") or g.get("silly_sort")
        if fn is None or not callable(fn):
            return {"ok": False, "error": "Define a function silly_sort(arr).", "stdout": stdout.getvalue()}

        traced = TraceList(input_arr)
        out = fn(traced)
        if out is None:
            out = traced
        try:
            output = list(out)
        except Exception:
            return {"ok": False, "error": "Return a list (or mutate arr and return it).", "stdout": stdout.getvalue()}

        steps = traced.steps()
        # If the user returned a new list (or changed the length), we may not have captured transitions.
        # Still, include the final output as the last frame when it differs.
        if len(steps) > 0 and output != steps[-1]:
            steps.append(list(output))

        return {
            "ok": True,
            "output": output,
            "steps": steps,
            "stdout": stdout.getvalue(),
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "stdout": stdout.getvalue(),
        }
    finally:
        sys.stdout = old
`

async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      await loadScript(PYODIDE_JS_URL)
      if (!window.loadPyodide) throw new Error('Pyodide loader missing.')

      const pyodide = await window.loadPyodide({ indexURL: PYODIDE_BASE_URL })

      // Best-effort timeout support via the interrupt buffer.
      try {
        const buf = new SharedArrayBuffer(4)
        const interruptBuffer = new Int32Array(buf)
        pyodide.setInterruptBuffer(interruptBuffer)
        pyodide.__sillySortInterruptBuffer = interruptBuffer
      } catch {
        pyodide.__sillySortInterruptBuffer = null
      }

      await pyodide.runPythonAsync(PY_PRELUDE)
      return pyodide
    })()
  }
  return pyodidePromise
}

export async function runSillySort({
  code,
  input,
  timeoutMs,
}: {
  code: string
  input: number[]
  timeoutMs: number
}): Promise<PyRunResult> {
  const pyodide = await getPyodide()

  const interrupt: Int32Array | null = pyodide.__sillySortInterruptBuffer ?? null
  if (interrupt) interrupt[0] = 0

  const timer = window.setTimeout(() => {
    if (interrupt) interrupt[0] = 2
  }, timeoutMs)

  try {
    const pyCode = pyodide.toPy(code)
    const pyInput = pyodide.toPy(input)
    pyodide.globals.set("code", pyCode)
    pyodide.globals.set("input_arr", pyInput)

    const proxy = await pyodide.runPythonAsync(
      "run_user(code, input_arr)"
    )

    try {
      const js = proxy.toJs({ dict_converter: Object.fromEntries })
      return js as PyRunResult
    } finally {
      proxy.destroy?.()
      pyCode.destroy?.()
      pyInput.destroy?.()
    }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e), stdout: '' }
  } finally {
    window.clearTimeout(timer)
    if (interrupt) interrupt[0] = 0
  }
}
