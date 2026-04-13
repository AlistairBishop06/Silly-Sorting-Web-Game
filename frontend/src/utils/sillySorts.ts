export type SillySort = {
  name: string
  description: string
  // Important implementation detail: each challenge is a simple object with a validator.
  validator: (input: number[], output: number[]) => boolean
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
    description: 'Replace every value with the average of the array (equal outcomes for all).',
    validator: (input, output) => {
      const avg = average(input)
      const tol = 1e-6
      return output.length === input.length && output.every((v) => Number.isFinite(v) && Math.abs(v - avg) <= tol)
    },
  },
  {
    name: 'Lazy Sort',
    description: "Do nothing. Return the input unchanged and hope it’s sorted.",
    validator: (input, output) => isSameArray(input, output),
  },
  {
    name: 'Anxious Sort',
    description: 'Swap neighbours until the list is sorted (it’s okay to be nervous about it).',
    validator: (_input, output) => isSortedAsc(output),
  },
  {
    name: 'Ego Sort',
    description:
      'Move the largest number to the front (index 0). Keep everyone else in the same relative order.',
    validator: (input, output) => {
      if (input.length !== output.length) return false
      if (!multisetEqual(input, output)) return false
      const mx = Math.max(...input)
      if (output[0] !== mx) return false
      const firstMaxIdx = input.indexOf(mx)
      const rest = [...input.slice(0, firstMaxIdx), ...input.slice(firstMaxIdx + 1)]
      return isSameArray(rest, output.slice(1))
    },
  },
  {
    name: 'Reverse Democracy Sort',
    description:
      'Find the most common number (the “mode”) and turn every occurrence of it into 100. Leave everything else unchanged.',
    validator: (input, output) => {
      if (input.length !== output.length) return false
      const m = mode(input)
      for (let i = 0; i < input.length; i++) {
        if (input[i] === m) {
          if (output[i] !== 100) return false
        } else {
          if (output[i] !== input[i]) return false
        }
      }
      return true
    },
  },
  {
    name: 'Centrist Sort',
    description: 'Replace every value with the median of the array (the safest possible take).',
    validator: (input, output) => {
      if (input.length !== output.length) return false
      const sorted = [...input].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      const median = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
      const tol = 1e-6
      return output.every((v) => Number.isFinite(v) && Math.abs(v - median) <= tol)
    },
  },
  {
    name: 'Vibe Sort',
    description: 'Rotate the array until the smallest number is first. Keep the relative order (just vibing in a circle).',
    validator: (input, output) => {
      if (input.length !== output.length) return false
      if (!multisetEqual(input, output)) return false
      const mn = Math.min(...input)
      if (output[0] !== mn) return false
      const k = input.indexOf(mn)
      const rotated = [...input.slice(k), ...input.slice(0, k)]
      return isSameArray(rotated, output)
    },
  },
  {
    name: 'Chaotic Neutral Sort',
    description: 'Put evens first (ascending), then odds (descending). No further questions.',
    validator: (_input, output) => {
      const evens = output.filter((v) => v % 2 === 0).slice().sort((a, b) => a - b)
      const odds = output.filter((v) => v % 2 !== 0).slice().sort((a, b) => b - a)
      return isSameArray([...evens, ...odds], output)
    },
  },
]

export function getRandomSillySort(): SillySort {
  return SILLY_SORTS[Math.floor(Math.random() * SILLY_SORTS.length)]
}

export function validateSillySort(sort: SillySort, input: number[], output: number[]) {
  try {
    return sort.validator(input, output)
  } catch {
    return false
  }
}

