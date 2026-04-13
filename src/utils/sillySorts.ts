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

  // =========================
  // NEW SILLY SORTS ADDED
  // =========================

  {
    name: 'Stalin Sort',
    description: 'Eliminate any element that breaks ascending order. No mercy.',
    validator: (input, output) => {
      if (output.length === 0) return input.length === 0
      let last = -Infinity
      for (const v of output) {
        if (v < last) return false
        last = v
      }
      return true
    },
  },
  {
    name: 'Main Character Sort',
    description: 'One number becomes the protagonist; everyone else copies them.',
    validator: (input, output) => {
      if (input.length !== output.length) return false
      const candidates = new Set(input)
      for (const c of candidates) {
        if (output.every((v) => v === c)) return true
      }
      return false
    },
  },
  {
    name: 'Gaslight Sort',
    description: 'The list is already sorted. Trust me.',
    validator: (_input, _output) => true,
  },
  {
    name: 'Therapy Sort',
    description: 'Every number slowly moves toward the average.',
    validator: (input, output) => {
      const avg = average(input)
      const tol = 1e-6
      return (
        input.length === output.length &&
        output.every((v, i) => Math.abs(v - avg) <= Math.abs(input[i] - avg) + tol)
      )
    },
  },
  {
    name: 'Lottery Sort',
    description: 'Completely random redistribution of values.',
    validator: (input, output) => {
      return input.length === output.length && !isSameArray(input, output)
    },
  },
  {
    name: 'Narcissist Sort',
    description: 'Everything becomes the maximum value because it deserves it.',
    validator: (input, output) => {
      const mx = Math.max(...input)
      return output.length === input.length && output.every((v) => v === mx)
    },
  },
  {
    name: 'Introvert Sort',
    description: 'Only local neighbour interactions are allowed.',
    validator: (_input, output) => {
      return output.length > 0 && output.length === [...output].length
    },
  },
  {
    name: 'Extrovert Sort',
    description: 'Every element interacts with every other element at least once.',
    validator: (input, output) => {
      return multisetEqual(input, output) && !isSameArray(input, output)
    },
  },
  {
    name: 'Overthinking Sort',
    description: 'Try sorting but second guess every decision.',
    validator: (input, output) => {
      if (input.length !== output.length) return false

      let inversions = 0
      for (let i = 0; i < output.length; i++) {
        for (let j = i + 1; j < output.length; j++) {
          if (output[i] > output[j]) inversions++
        }
      }

      return inversions <= 3
    },
  },
  {
    name: 'Procrastination Sort',
    description: 'Delay sorting until the last possible moment.',
    validator: (input, output) => {
      return isSameArray([...input.slice(1), input[0]], output)
    },
  },
  {
    name: 'Existential Sort',
    description: 'Nothing matters anymore, everything becomes zero.',
    validator: (_input, output) => {
      return output.every((v) => v === 0)
    },
  },
  {
    name: 'Influencer Sort',
    description: 'The first element sets the trend; everyone follows it.',
    validator: (input, output) => {
      return output.every((v) => v === input[0])
    },
  },
  {
    name: 'Middle Child Sort',
    description: 'Only the middle values get attention.',
    validator: (input, output) => {
      const sorted = [...input].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return output[mid] === sorted[mid]
    },
  },
  {
    name: 'Drama Sort',
    description: 'The largest and smallest values swap repeatedly for attention.',
    validator: (input, output) => {
      return multisetEqual(input, output)
    },
  },
  {
    name: 'Commitment Issues Sort',
    description: 'Starts sorting but gives up halfway.',
    validator: (input, output) => {
      const half = Math.floor(input.length / 2)
      return isSortedAsc(output.slice(0, half))
    },
  },
  {
    name: 'Impostor Sort',
    description: 'Something suspicious has been added to the array.',
    validator: (input, output) => {
      return output.length === input.length + 1
    },
  },
  {
    name: 'Time Loop Sort',
    description: 'Everything resets to the original state.',
    validator: (input, output) => isSameArray(input, output),
  },
  {
    name: 'Pyramid Scheme Sort',
    description: 'Values climb towards the biggest number.',
    validator: (input, output) => {
      const mx = Math.max(...input)
      return output.some((v) => v === mx)
    },
  },
  {
    name: 'Sleep Sort (Cursed)',
    description: 'Smaller numbers wake up first somehow.',
    validator: (_input, output) => isSortedAsc(output),
  },
  {
    name: 'Vibe Check Sort',
    description: 'Only keep the numbers that pass the vibe check.',
    validator: (input, output) => {
      const avg = average(input)
      return output.every((v) => v >= avg)
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

