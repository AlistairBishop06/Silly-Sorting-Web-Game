export type SillySort = {
  name: string
  description: string
  // Important implementation detail: each challenge is a simple object with a validator.
  validator: (input: number[], output: number[]) => boolean
  expectedOutput: (input: number[]) => string
  // When true, returning the input unchanged does NOT count as a solution.
  // When a function, it can decide per-input (so we don't reject "already satisfies the rule" edge cases).
  cannotBeInput?: boolean | ((input: number[]) => boolean)
}

function isSameArray(a: number[], b: number[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

function multisetEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false
  const m = new Map<number, number>()
  for (const x of a) m.set(x, (m.get(x) ?? 0) + 1)
  for (const y of b) {
    const n = m.get(y)
    if (!n) return false
    if (n === 1) m.delete(y)
    else m.set(y, n - 1)
  }
  return m.size === 0
}

function isSortedAsc(arr: number[]) {
  for (let i = 1; i < arr.length; i++) if (arr[i - 1] > arr[i]) return false
  return true
}

function average(arr: number[]) {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function formatNumber(n: number) {
  if (!Number.isFinite(n)) return String(n)
  return Math.round(n * 1000) / 1000
}

function formatArray(arr: number[]) {
  return `[${arr.map(formatNumber).join(', ')}]`
}

function median(arr: number[]) {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function mode(arr: number[]) {
  const counts = new Map<number, number>()
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1)
  let best: { v: number; n: number; firstIdx: number } | null = null
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]
    const n = counts.get(v) ?? 0
    if (!best) best = { v, n, firstIdx: i }
    else if (n > best.n) best = { v, n, firstIdx: i }
    else if (n === best.n && best.firstIdx > i) best = { v, n, firstIdx: i }
  }
  return best?.v ?? arr[0]
}

export const SILLY_SORTS: SillySort[] = [
  {
    name: 'Communist Sort',
    description:
      'Replace every element with the arithmetic mean of the input array. Output must be same length, all values identical.',
    cannotBeInput: (input) => !input.every((v) => v === average(input)),
    validator: (input, output) => {
      const avg = average(input)
      const tol = 1e-6
      return (
        output.length === input.length &&
        output.every((v) => Math.abs(v - avg) <= tol)
      )
    },
    expectedOutput: (input) => {
      const avg = average(input)
      return formatArray(input.map(() => avg))
    },
  },

  {
    name: 'Lazy Sort',
    description:
      'Return the array exactly unchanged. No modifications in values or order.',
    validator: (input, output) => isSameArray(input, output),
    expectedOutput: (input) => formatArray(input),
  },

  {
    name: 'Anxious Sort',
    description:
      'Return the array sorted in ascending order. Must contain all original elements.',
    cannotBeInput: (input) => !isSortedAsc(input),
    validator: (_input, output) => isSortedAsc(output),
    expectedOutput: (input) => formatArray([...input].sort((a, b) => a - b)),
  },

  {
    name: 'Ego Sort',
    description:
      'Move the maximum value to index 0. All other elements must remain in original relative order.',
    cannotBeInput: (input) => input.length > 0 && input[0] !== Math.max(...input),
    validator: (input, output) => {
      if (input.length !== output.length) return false
      const mx = Math.max(...input)
      if (output[0] !== mx) return false
      const idx = input.indexOf(mx)
      const rest = [...input.slice(0, idx), ...input.slice(idx + 1)]
      return isSameArray(rest, output.slice(1))
    },
    expectedOutput: (input) => {
      if (input.length === 0) return '[]'
      const mx = Math.max(...input)
      const idx = input.indexOf(mx)
      const rest = [...input.slice(0, idx), ...input.slice(idx + 1)]
      return formatArray([mx, ...rest])
    },
  },

  {
    name: 'Reverse Democracy Sort',
    description:
      'Replace all occurrences of the most frequent value (mode) with 100. All other values remain unchanged.',
    cannotBeInput: (input) => {
      const m = mode(input)
      const expected = input.map((v) => (v === m ? 100 : v))
      return !isSameArray(input, expected)
    },
    validator: (input, output) => {
      const m = mode(input)
      return input.every((v, i) =>
        v === m ? output[i] === 100 : output[i] === v
      )
    },
    expectedOutput: (input) => {
      const m = mode(input)
      return formatArray(input.map((v) => (v === m ? 100 : v)))
    },
  },

  {
    name: 'Centrist Sort',
    description:
      'Replace every element with the median value of the array. All output values must be identical.',
    cannotBeInput: (input) => !input.every((v) => v === median(input)),
    validator: (input, output) => {
      const med = median(input)
      return output.length === input.length && output.every((v) => v === med)
    },
    expectedOutput: (input) => {
      const med = median(input)
      return formatArray(input.map(() => med))
    },
  },

  {
    name: 'Vibe Sort',
    description:
      'Rotate array so the smallest value becomes the first element. Relative order must be preserved.',
    cannotBeInput: (input) => input.length > 0 && input.indexOf(Math.min(...input)) !== 0,
    validator: (input, output) => {
      const mn = Math.min(...input)
      const idx = input.indexOf(mn)
      const rotated = [...input.slice(idx), ...input.slice(0, idx)]
      return isSameArray(rotated, output)
    },
    expectedOutput: (input) => {
      if (input.length === 0) return '[]'
      const mn = Math.min(...input)
      const idx = input.indexOf(mn)
      return formatArray([...input.slice(idx), ...input.slice(0, idx)])
    },
  },

  {
    name: 'Chaotic Neutral Sort',
    description:
      'Reorder array so evens come first in ascending order, followed by odds in descending order.',
    cannotBeInput: (input) => {
      const evens = input.filter((v) => v % 2 === 0).slice().sort((a, b) => a - b)
      const odds = input.filter((v) => v % 2 !== 0).slice().sort((a, b) => b - a)
      const expected = [...evens, ...odds]
      return !isSameArray(input, expected)
    },
    validator: (_input, output) => {
      const evens = output.filter((v) => v % 2 === 0).slice().sort((a, b) => a - b)
      const odds = output.filter((v) => v % 2 !== 0).slice().sort((a, b) => b - a)
      return isSameArray([...evens, ...odds], output)
    },
    expectedOutput: (input) => {
      const evens = input.filter((v) => v % 2 === 0).slice().sort((a, b) => a - b)
      const odds = input.filter((v) => v % 2 !== 0).slice().sort((a, b) => b - a)
      return formatArray([...evens, ...odds])
    },
  },

  {
    name: 'Stalin Sort',
    description:
      'Traverse left to right and remove any element that is smaller than the previous kept element.',
    cannotBeInput: (input) => !isSortedAsc(input),
    validator: (input, output) => {
      let last = -Infinity
      for (const v of output) {
        if (v < last) return false
        last = v
      }
      return true
    },
    expectedOutput: (input) => {
      const kept: number[] = []
      let last = -Infinity
      for (const v of input) {
        if (v >= last) {
          kept.push(v)
          last = v
        }
      }
      return formatArray(kept)
    },
  },

  {
    name: 'Main Character Sort',
    description:
      'Choose one value from the input. Replace every element with that chosen value.',
    cannotBeInput: (input) => input.length > 0 && input.some((v) => v !== input[0]),
    validator: (input, output) => {
      if (input.length !== output.length) return false
      return new Set(input).has(output[0]) && output.every((v) => v === output[0])
    },
    expectedOutput: (input) => {
      const v = input[0] ?? 0
      return formatArray(input.map(() => v))
    },
  },

  {
    name: 'Gaslight Sort',
    description:
      'Return any array of the same length. Validation always passes regardless of correctness.',
    validator: () => true,
    expectedOutput: (input) => formatArray(input),
  },

  {
    name: 'Therapy Sort',
    description:
      'Move each element halfway toward the mean of the array.',
    cannotBeInput: (input) => {
      const avg = average(input)
      const tol = 1e-9
      return input.some((v) => Math.abs(v - avg) > tol)
    },
    validator: (input, output) => {
      const avg = average(input)
      return input.every((v, i) =>
        Math.abs(output[i] - (v + avg) / 2) < 1e-6
      )
    },
    expectedOutput: (input) => {
      const avg = average(input)
      return formatArray(input.map((v) => (v + avg) / 2))
    },
  },

  {
    name: 'Lottery Sort',
    description:
      'Return any rearrangement of the array that is not identical to the input.',
    validator: (input, output) =>
      input.length === output.length && !isSameArray(input, output),
    expectedOutput: (input) => formatArray([...input].reverse()),
  },

  {
    name: 'Narcissist Sort',
    description:
      'Replace all elements with the maximum value in the array.',
    cannotBeInput: (input) => {
      if (input.length === 0) return false
      const mx = Math.max(...input)
      return input.some((v) => v !== mx)
    },
    validator: (input, output) => {
      const mx = Math.max(...input)
      return output.every((v) => v === mx)
    },
    expectedOutput: (input) => {
      const mx = Math.max(...input)
      return formatArray(input.map(() => mx))
    },
  },

  {
    name: 'Introvert Sort',
    description:
      'Return any valid non-empty array derived from input without changing length.',
    cannotBeInput: true,
    validator: (input, output) =>
      input.length === output.length && output.length > 0,
    expectedOutput: (input) => formatArray(input),
  },

  {
    name: 'Extrovert Sort',
    description:
      'Return a permutation of the input that is different from the original order.',
    validator: (input, output) =>
      multisetEqual(input, output) && !isSameArray(input, output),
    expectedOutput: (input) => formatArray([...input].slice().reverse()),
  },

  {
    name: 'Overthinking Sort',
    description:
      'Return an array with at most 3 inversions compared to sorted order.',
    cannotBeInput: (input) => {
      let inv = 0
      for (let i = 0; i < input.length; i++) {
        for (let j = i + 1; j < input.length; j++) if (input[i] > input[j]) inv++
      }
      return inv > 0
    },
    validator: (input, output) => {
      let inv = 0
      for (let i = 0; i < output.length; i++) {
        for (let j = i + 1; j < output.length; j++) {
          if (output[i] > output[j]) inv++
        }
      }
      return inv <= 3
    },
    expectedOutput: (input) =>
      formatArray([...input].sort((a, b) => a - b)),
  },

  {
    name: 'Procrastination Sort',
    description:
      'Rotate array left by one position.',
    cannotBeInput: (input) => input.length > 1 && input.some((v) => v !== input[0]),
    validator: (input, output) =>
      isSameArray([...input.slice(1), input[0]], output),
    expectedOutput: (input) =>
      input.length ? formatArray([...input.slice(1), input[0]]) : '[]',
  },

  {
    name: 'Existential Sort',
    description:
      'Replace every element with 0.',
    cannotBeInput: (input) => input.some((v) => v !== 0),
    validator: (_input, output) => output.every((v) => v === 0),
    expectedOutput: (input) => formatArray(input.map(() => 0)),
  },

  {
    name: 'Influencer Sort',
    description:
      'Replace every element with the first element of the array.',
    cannotBeInput: (input) => input.length > 0 && input.some((v) => v !== input[0]),
    validator: (input, output) =>
      output.every((v) => v === input[0]),
    expectedOutput: (input) =>
      formatArray(input.map(() => input[0] ?? 0)),
  },

  {
    name: 'Middle Child Sort',
    description:
      'Ensure the middle element matches the median value.',
    cannotBeInput: (input) => {
      if (input.length === 0) return false
      const sorted = [...input].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return input[mid] !== sorted[mid]
    },
    validator: (input, output) => {
      const sorted = [...input].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return output[mid] === sorted[mid]
    },
    expectedOutput: (input) => {
      const sorted = [...input].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      const out = [...input]
      out[mid] = sorted[mid]
      return formatArray(out)
    },
  },

  {
    name: 'Drama Sort',
    description:
      'Return any permutation of the input array.',
    cannotBeInput: (input) => input.length > 1 && input.some((v) => v !== input[0]),
    validator: (input, output) =>
      multisetEqual(input, output),
    expectedOutput: (input) => formatArray([...input].reverse()),
  },

  {
    name: 'Commitment Issues Sort',
    description:
      'Sort only the first half of the array in ascending order.',
    cannotBeInput: (input) => {
      const half = Math.floor(input.length / 2)
      return !isSortedAsc(input.slice(0, half))
    },
    validator: (input, output) => {
      const half = Math.floor(input.length / 2)
      return isSortedAsc(output.slice(0, half))
    },
    expectedOutput: (input) => {
      const half = Math.floor(input.length / 2)
      const first = [...input.slice(0, half)].sort((a, b) => a - b)
      return formatArray([...first, ...input.slice(half)])
    },
  },

  {
    name: 'Impostor Sort',
    description:
      'Return an array with exactly one additional element appended.',
    validator: (input, output) =>
      output.length === input.length + 1,
    expectedOutput: (input) =>
      formatArray([...input, 0]),
  },

  {
    name: 'Time Loop Sort',
    description:
      'Return the array unchanged.',
    validator: (input, output) =>
      isSameArray(input, output),
    expectedOutput: (input) => formatArray(input),
  },

  {
    name: 'Pyramid Scheme Sort',
    description:
      'Ensure the maximum value exists somewhere in the output array.',
    cannotBeInput: (input) => {
      if (input.length === 0) return false
      const mx = Math.max(...input)
      return input.some((v) => v !== mx)
    },
    validator: (input, output) =>
      output.includes(Math.max(...input)),
    expectedOutput: (input) => formatArray(input),
  },

  {
    name: 'Sleep Sort (Cursed)',
    description:
      'Return the array sorted in ascending order.',
    cannotBeInput: (input) => !isSortedAsc(input),
    validator: (_input, output) => isSortedAsc(output),
    expectedOutput: (input) =>
      formatArray([...input].sort((a, b) => a - b)),
  },

  {
    name: 'Vibe Check Sort',
    description:
      'Only keep values greater than or equal to the mean of the array.',
    cannotBeInput: (input) => {
      const avg = average(input)
      return input.some((v) => v < avg)
    },
    validator: (input, output) => {
      const avg = average(input)
      return output.every((v) => v >= avg)
    },
    expectedOutput: (input) => {
      const avg = average(input)
      return formatArray(input.filter((v) => v >= avg))
    },
  },
]

export function getRandomSillySort(): SillySort {
  return SILLY_SORTS[Math.floor(Math.random() * SILLY_SORTS.length)]
}

export function validateSillySort(sort: SillySort, input: number[], output: number[]) {
  try {
    const forbidUnchanged =
      typeof sort.cannotBeInput === 'function'
        ? sort.cannotBeInput(input)
        : sort.cannotBeInput
    if (forbidUnchanged && isSameArray(input, output)) return false
    return sort.validator(input, output)
  } catch {
    return false
  }
}
