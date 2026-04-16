export type SillySort = {
  name: string
  description: string
  // Important implementation detail: each challenge is a simple object with a validator.
  validator: (input: number[], output: number[]) => boolean
  expectedOutput: (input: number[]) => string
  // When true, returning the input unchanged does NOT count as a solution.
  // When a function, it can decide per-input (so we don't reject "already satisfies the rule" edge cases).
  cannotBeInput?: boolean | ((input: number[]) => boolean)
  /** Set for boss-tier challenges (harder rules). */
  isBoss?: boolean
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

function isSortedDesc(arr: number[]) {
  for (let i = 1; i < arr.length; i++) if (arr[i - 1] < arr[i]) return false
  return true
}

function sortAsc(arr: number[]) {
  return [...arr].sort((a, b) => a - b)
}

function sortDesc(arr: number[]) {
  return [...arr].sort((a, b) => b - a)
}

function arraysAlmostEqual(a: number[], b: number[], tol: number) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > tol) return false
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
      'Replace every element with the arithmetic mean of the input array, then sort ascending. Output must be same length, all values identical.',
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
      return formatArray(sortAsc(input.map(() => avg)))
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
      'Replace all occurrences of the most frequent value (mode) with 100, then sort descending. All other values remain unchanged.',
    cannotBeInput: (input) => {
      const m = mode(input)
      const expected = sortDesc(input.map((v) => (v === m ? 100 : v)))
      return !isSameArray(input, expected)
    },
    validator: (input, output) => {
      const m = mode(input)
      const expected = sortDesc(input.map((v) => (v === m ? 100 : v)))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => {
      const m = mode(input)
      return formatArray(sortDesc(input.map((v) => (v === m ? 100 : v))))
    },
  },

  {
    name: 'Centrist Sort',
    description:
      'Replace every element with the median value of the array, then sort ascending. All output values must be identical.',
    cannotBeInput: (input) => !input.every((v) => v === median(input)),
    validator: (input, output) => {
      const med = median(input)
      return output.length === input.length && output.every((v) => v === med)
    },
    expectedOutput: (input) => {
      const med = median(input)
      return formatArray(sortAsc(input.map(() => med)))
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
    validator: (_input, output) => {
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
      'Choose one value from the input. Replace every element with that chosen value, then sort descending.',
    cannotBeInput: (input) => input.length > 0 && input.some((v) => v !== input[0]),
    validator: (input, output) => {
      if (input.length !== output.length) return false
      return new Set(input).has(output[0]) && output.every((v) => v === output[0]) && isSortedDesc(output)
    },
    expectedOutput: (input) => {
      const v = input[0] ?? 0
      return formatArray(sortDesc(input.map(() => v)))
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
      'Move each element halfway toward the mean of the array, then sort ascending.',
    cannotBeInput: (input) => {
      const avg = average(input)
      const tol = 1e-9
      return input.some((v) => Math.abs(v - avg) > tol)
    },
    validator: (input, output) => {
      const avg = average(input)
      const expected = sortAsc(input.map((v) => (v + avg) / 2))
      return arraysAlmostEqual(expected, output, 1e-6)
    },
    expectedOutput: (input) => {
      const avg = average(input)
      return formatArray(sortAsc(input.map((v) => (v + avg) / 2)))
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
      'Replace all elements with the maximum value in the array, then sort descending.',
    cannotBeInput: (input) => {
      if (input.length === 0) return false
      const mx = Math.max(...input)
      return input.some((v) => v !== mx)
    },
    validator: (input, output) => {
      const mx = Math.max(...input)
      return output.every((v) => v === mx) && isSortedDesc(output)
    },
    expectedOutput: (input) => {
      const mx = Math.max(...input)
      return formatArray(sortDesc(input.map(() => mx)))
    },
  },

  {
    name: 'Introvert Sort',
    description:
      'Sort the array in ascending order, but insert a None (null) value between every element. The output must alternate between numbers and nulls, starting and ending with a number.',
    cannotBeInput: true,
    validator: (input, output) => {
      if (input.length === 0) return output.length === 0

      const sorted = [...input].sort((a, b) => a - b)

      // must be: num, null, num, null...
      if (output.length !== sorted.length * 2 - 1) return false

      for (let i = 0; i < output.length; i++) {
        if (i % 2 === 0) {
          if (output[i] !== sorted[i / 2]) return false
        } else {
          if (output[i] !== null) return false
        }
      }

      return true
    },
    expectedOutput: (input) => {
      const sorted = [...input].sort((a, b) => a - b)
      const result: (number | null)[] = []

      for (let i = 0; i < sorted.length; i++) {
        result.push(sorted[i])
        if (i !== sorted.length - 1) result.push(null)
      }

      return formatArray(result as number[])
    },
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
    validator: (_input, output) => {
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
      'Replace every element with 0, then sort ascending.',
    cannotBeInput: (input) => input.some((v) => v !== 0),
    validator: (_input, output) => output.every((v) => v === 0),
    expectedOutput: (input) => formatArray(sortAsc(input.map(() => 0))),
  },

  {
    name: 'Influencer Sort',
    description:
      'Replace every element with the first element of the array, then sort descending.',
    cannotBeInput: (input) => input.length > 0 && input.some((v) => v !== input[0]),
    validator: (input, output) =>
      output.every((v) => v === input[0]) && isSortedDesc(output),
    expectedOutput: (input) =>
      formatArray(sortDesc(input.map(() => input[0] ?? 0))),
  },

  {
    name: 'Middle Child Sort',
    description:
      'Ensure the middle element matches the median value, then sort ascending.',
    cannotBeInput: (input) => {
      if (input.length === 0) return false
      const sorted = [...input].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return input[mid] !== sorted[mid]
    },
    validator: (input, output) => {
      const sorted = [...input].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      const out = [...input]
      out[mid] = sorted[mid]
      return isSameArray(sortAsc(out), output)
    },
    expectedOutput: (input) => {
      const sorted = [...input].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      const out = [...input]
      out[mid] = sorted[mid]
      return formatArray(sortAsc(out))
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

  {
    name: 'Sniper Sort',
    description: 'Remove the first occurrence of the maximum value. All other elements keep their original order.',
    cannotBeInput: (input) => {
      if (input.length === 0) return false
      const mx = Math.max(...input)
      return input.indexOf(mx) === -1
    },
    validator: (input, output) => {
      if (input.length === 0) return output.length === 0
      const mx = Math.max(...input)
      const idx = input.indexOf(mx)
      const expected = [...input.slice(0, idx), ...input.slice(idx + 1)]
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => {
      if (input.length === 0) return '[]'
      const mx = Math.max(...input)
      const idx = input.indexOf(mx)
      return formatArray([...input.slice(0, idx), ...input.slice(idx + 1)])
    },
  },

  {
    name: 'Tidal Sort',
    description: 'Reorder by alternately picking the current minimum then maximum from remaining elements.',
    cannotBeInput: (input) => {
      if (input.length <= 1) return false
      const pool = [...input]
      const result: number[] = []
      let pickMin = true
      while (pool.length) {
        const idx = pickMin
          ? pool.indexOf(Math.min(...pool))
          : pool.indexOf(Math.max(...pool))
        result.push(pool.splice(idx, 1)[0])
        pickMin = !pickMin
      }
      return !isSameArray(input, result)
    },
    validator: (_input, output) => {
      if (output.length <= 1) return true
      const pool = [...output]
      const result: number[] = []
      let pickMin = true
      while (pool.length) {
        const idx = pickMin
          ? pool.indexOf(Math.min(...pool))
          : pool.indexOf(Math.max(...pool))
        result.push(pool.splice(idx, 1)[0])
        pickMin = !pickMin
      }
      return isSameArray(output, result)
    },
    expectedOutput: (input) => {
      const pool = [...input]
      const result: number[] = []
      let pickMin = true
      while (pool.length) {
        const idx = pickMin
          ? pool.indexOf(Math.min(...pool))
          : pool.indexOf(Math.max(...pool))
        result.push(pool.splice(idx, 1)[0])
        pickMin = !pickMin
      }
      return formatArray(result)
    },
  },

  {
    name: 'Clown Sort',
    description: 'Interleave the ascending-sorted and descending-sorted versions of the array (sorted first, then reversed, alternating by index).',
    cannotBeInput: (input) => {
      const asc = [...input].sort((a, b) => a - b)
      const desc = [...input].sort((a, b) => b - a)
      const result: number[] = []
      for (let i = 0; i < input.length; i++)
        result.push(i % 2 === 0 ? asc[Math.floor(i / 2)] : desc[Math.floor(i / 2)])
      return !isSameArray(input, result)
    },
    validator: (_input, output) => {
      const evens = output.filter((_, i) => i % 2 === 0)
      const odds = output.filter((_, i) => i % 2 !== 0)
      return isSortedAsc(evens) && isSortedAsc([...odds].reverse())
    },
    expectedOutput: (input) => {
      const asc = [...input].sort((a, b) => a - b)
      const desc = [...input].sort((a, b) => b - a)
      const result: number[] = []
      for (let i = 0; i < input.length; i++)
        result.push(i % 2 === 0 ? asc[Math.floor(i / 2)] : desc[Math.floor(i / 2)])
      return formatArray(result)
    },
  },

  {
    name: 'Memory Leak Sort',
    description:
      'Each step loses one element from the array until sorted.',
    cannotBeInput: true,
    validator: (_input, output) => output.length <= 10,
    expectedOutput: (input) => formatArray(input.slice(0, Math.floor(input.length / 2))),
  },

  {
    name: 'Quantum Sort',
    description:
      'Array must be both sorted and unsorted at the same time (valid if it is monotonic or constant).',
    cannotBeInput: true,
    validator: (_input, output) => {
      const asc = isSortedAsc(output)
      const allSame = output.every((v) => v === output[0])
      return asc || allSame
    },
    expectedOutput: (input) => formatArray([...input].sort((a, b) => a - b)),
  },

  {
    name: 'Identity Crisis Sort',
    description:
      'At least one element must change, but multiset must remain identical.',
    cannotBeInput: true,
    validator: (input, output) =>
      multisetEqual(input, output) && !isSameArray(input, output),
    expectedOutput: (input) => formatArray([...input].reverse()),
  },

  {
    name: 'Ghost Sort',
    description: 'The array transcends this physical dimension. Returns an empty array.',
    cannotBeInput: (input) => input.length > 0,
    validator: (_input, output) => output.length === 0,
    expectedOutput: () => '[]',
  },

  {
    name: 'Inflation Sort',
    description: 'Every value increases by 1 to account for economic shifts, then sort descending.',
    cannotBeInput: true,
    validator: (input, output) => {
      const expected = sortDesc(input.map((v) => v + 1))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => formatArray(sortDesc(input.map((v) => v + 1))),
  },

  {
    name: 'Pessimist Sort',
    description: 'Replace every element with the minimum value of the array, then sort ascending.',
    cannotBeInput: (input) => {
      if (input.length === 0) return false
      const mn = Math.min(...input)
      return input.some((v) => v !== mn)
    },
    validator: (input, output) => {
      const mn = Math.min(...input)
      const expected = sortAsc(input.map(() => mn))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => {
      const mn = Math.min(...input)
      return formatArray(sortAsc(input.map(() => mn)))
    },
  },

  {
    name: 'Dictionary Sort',
    description: 'Sort the numbers alphabetically based on their string representation.',
    cannotBeInput: (input) => {
      const expected = [...input].sort((a, b) => String(a).localeCompare(String(b)))
      return !isSameArray(input, expected)
    },
    validator: (_input, output) => {
      const expected = [...output].sort((a, b) => String(a).localeCompare(String(b)))
      return isSameArray(output, expected)
    },
    expectedOutput: (input) =>
      formatArray([...input].sort((a, b) => String(a).localeCompare(String(b)))),
  },

  {
    name: 'Deja Vu Sort',
    description: 'Replace the second half of the array with a exact copy of the first half, then sort descending.',
    cannotBeInput: (input) => {
      const half = Math.floor(input.length / 2)
      const first = input.slice(0, half)
      const second = input.slice(input.length - half)
      return !isSameArray(first, second)
    },
    validator: (input, output) => {
      const half = Math.floor(input.length / 2)
      const first = input.slice(0, half)
      const result = [...input]
      for (let i = 0; i < half; i++) {
        result[input.length - half + i] = first[i]
      }
      const expected = sortDesc(result)
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => {
      const half = Math.floor(input.length / 2)
      const first = input.slice(0, half)
      const result = [...input]
      for (let i = 0; i < half; i++) {
        result[input.length - half + i] = first[i]
      }
      return formatArray(sortDesc(result))
    },
  },

  {
    name: 'Middle Management Sort',
    description: 'Remove the first and last elements of the array.',
    cannotBeInput: (input) => input.length >= 2,
    validator: (input, output) => {
      if (input.length < 2) return output.length === 0
      return isSameArray(input.slice(1, -1), output)
    },
    expectedOutput: (input) =>
      input.length < 2 ? '[]' : formatArray(input.slice(1, -1)),
  },

  {
    name: 'Clickbait Sort',
    description: 'The first element is replaced with 999,999 to grab attention, then sort ascending. The rest remain unchanged.',
    cannotBeInput: (input) => input.length > 0 && input[0] !== 999999,
    validator: (input, output) => {
      if (input.length === 0) return output.length === 0
      const expected = sortAsc([999999, ...input.slice(1)])
      return isSameArray(expected, output)
    },
    expectedOutput: (input) =>
      input.length === 0 ? '[]' : formatArray(sortAsc([999999, ...input.slice(1)])),
  },

  {
    name: 'Aesthetic Sort',
    description: 'Sort elements by the number of digits they contain (ascending).',
    cannotBeInput: (input) => {
      const expected = [...input].sort((a, b) => String(Math.abs(a)).length - String(Math.abs(b)).length)
      return !isSameArray(input, expected)
    },
    validator: (_input, output) => {
      const lens = output.map(v => String(Math.abs(v)).length)
      return isSortedAsc(lens)
    },
    expectedOutput: (input) =>
      formatArray([...input].sort((a, b) => String(Math.abs(a)).length - String(Math.abs(b)).length)),
  },

  {
    name: 'Thanos Sort',
    description: 'Perfectly balanced. Delete exactly half of the elements (rounded down).',
    cannotBeInput: (input) => input.length >= 2,
    validator: (input, output) => output.length === Math.ceil(input.length / 2),
    expectedOutput: (input) => formatArray(input.slice(0, Math.ceil(input.length / 2))),
  },

  {
    name: 'Binary Sort',
    description: 'Convert every number to 1 if it is greater than the mean, otherwise 0.',
    cannotBeInput: true,
    validator: (input, output) => {
      const avg = average(input)
      return output.every((v, i) => v === (input[i] > avg ? 1 : 0))
    },
    expectedOutput: (input) => {
      const avg = average(input)
      return formatArray(input.map((v) => (v > avg ? 1 : 0)))
    },
  },

  {
    name: 'Mirror Sort',
    description: 'The array becomes a palindrome by appending its own reverse.',
    cannotBeInput: true,
    validator: (_input, output) => {
      const rev = [...output].reverse()
      return isSameArray(output, rev)
    },
    expectedOutput: (input) => formatArray([...input, ...[...input].reverse()]),
  },

  {
    name: 'Ancestry Sort',
    description: 'Each element becomes the sum of itself and all previous elements (Prefix Sum), then sort descending.',
    cannotBeInput: true,
    validator: (input, output) => {
      let sum = 0
      const modified = input.map((v) => (sum += v))
      const expected = sortDesc(modified)
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => {
      let sum = 0
      return formatArray(sortDesc(input.map((v) => (sum += v))))
    },
  },

  {
    name: 'Privacy Sort',
    description: 'Redact all information. Replace every element with -1, then sort ascending.',
    cannotBeInput: (input) => input.some((v) => v !== -1),
    validator: (input, output) => {
      const expected = sortAsc(input.map(() => -1))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => formatArray(sortAsc(input.map(() => -1))),
  },

  {
    name: 'Speed Limit Sort',
    description: 'Any value exceeding 70 is "pulled over" and reduced to 70, then sort descending.',
    cannotBeInput: (input) => input.some((v) => v > 70),
    validator: (input, output) => {
      const expected = sortDesc(input.map((v) => (v > 70 ? 70 : v)))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) =>
      formatArray(sortDesc(input.map((v) => (v > 70 ? 70 : v)))),
  },

  {
    name: 'Small Talk Sort',
    description: 'The values are irrelevant. Replace every element with its index in the array, then sort ascending.',
    cannotBeInput: (input) => input.some((v, i) => v !== i),
    validator: (input, output) =>
      isSameArray(sortAsc(input.map((_, i) => i)), output),
    expectedOutput: (input) => formatArray(sortAsc(input.map((_, i) => i))),
  },

  {
    name: 'Dating App Sort',
    description: 'Swipe left on low standards. Keep only values greater than or equal to 50. Order remains unchanged.',
    cannotBeInput: (input) => input.some((v) => v < 50),
    validator: (input, output) => {
      const expected = input.filter((v) => v >= 50)
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => formatArray(input.filter((v) => v >= 50)),
  },

  {
    name: 'Tall Poppy Sort',
    description: 'The highest value is cut down. Replace the maximum value with the second-highest value in the array, then sort descending.',
    cannotBeInput: (input) => {
      if (input.length < 2) return false
      const mx = Math.max(...input)
      return input.includes(mx)
    },
    validator: (input, output) => {
      if (input.length === 0) return output.length === 0
      const sortedUnique = [...new Set(input)].sort((a, b) => b - a)
      const mx = sortedUnique[0]
      const second = sortedUnique[1] ?? mx
      const expected = sortDesc(input.map((v) => (v === mx ? second : v)))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => {
      const sortedUnique = [...new Set(input)].sort((a, b) => b - a)
      const mx = sortedUnique[0]
      const second = sortedUnique[1] ?? mx
      return formatArray(sortDesc(input.map((v) => (v === mx ? second : v))))
    },
  },

  {
    name: 'Black Friday Sort',
    description: 'Everything is 50% off! Every value is halved and rounded down, then sort ascending.',
    cannotBeInput: true,
    validator: (input, output) => {
      const expected = sortAsc(input.map((v) => Math.floor(v / 2)))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) =>
      formatArray(sortAsc(input.map((v) => Math.floor(v / 2)))),
  },

  {
    name: 'Nepotism Sort',
    description: 'The first three elements are replaced with the highest value in the array to give them a head start, then sort descending.',
    cannotBeInput: (input) => {
      if (input.length < 3) return false
      const mx = Math.max(...input)
      return input[0] !== mx || input[1] !== mx || input[2] !== mx
    },
    validator: (input, output) => {
      const mx = Math.max(...input)
      const expected = [...input]
      for (let i = 0; i < Math.min(input.length, 3); i++) expected[i] = mx
      return isSameArray(sortDesc(expected), output)
    },
    expectedOutput: (input) => {
      const mx = Math.max(...input)
      const res = [...input]
      for (let i = 0; i < Math.min(input.length, 3); i++) res[i] = mx
      return formatArray(sortDesc(res))
    },
  },

  {
    name: 'Bouncer Sort',
    description: 'Only even numbers are on the list. Replace all odd numbers with 0, then sort ascending.',
    cannotBeInput: (input) => input.some((v) => v % 2 !== 0),
    validator: (input, output) => {
      const expected = sortAsc(input.map((v) => (v % 2 === 0 ? v : 0)))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) =>
      formatArray(sortAsc(input.map((v) => (v % 2 === 0 ? v : 0)))),
  },

  {
    name: 'Tax Bracket Sort',
    description: 'High earners pay more. If a value is > 70, subtract 20. If > 40, subtract 10, then sort descending.',
    cannotBeInput: true,
    validator: (input, output) => {
      const calc = (v: number) => (v > 70 ? v - 20 : v > 40 ? v - 10 : v)
      const expected = sortDesc(input.map(calc))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) =>
      formatArray(sortDesc(input.map((v) => (v > 70 ? v - 20 : v > 40 ? v - 10 : v)))),
  },

  {
    name: 'One-Star Review Sort',
    description: 'Total disappointment. Replace every single element with 1, then sort ascending.',
    cannotBeInput: (input) => input.some((v) => v !== 1),
    validator: (input, output) => {
      const expected = sortAsc(input.map(() => 1))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => formatArray(sortAsc(input.map(() => 1))),
  },

  {
    name: 'Generational Wealth Sort',
    description: 'Success compounds over time. Add (index * 10) to every element, then sort descending.',
    cannotBeInput: true,
    validator: (input, output) => {
      const expected = sortDesc(input.map((v, i) => v + i * 10))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) =>
      formatArray(sortDesc(input.map((v, i) => v + i * 10))),
  },

  {
    name: 'Suburban Sprawl Sort',
    description: 'Everything needs more space. Insert 1000 between every original element.',
    cannotBeInput: true,
    validator: (input, output) => {
      if (input.length === 0) return output.length === 0
      if (output.length !== input.length * 2 - 1) return false
      return input.every((v, i) => output[i * 2] === v) &&
             output.filter((_, i) => i % 2 !== 1000).every(v => v === 1000)
    },
    expectedOutput: (input) => {
      const res: number[] = []
      input.forEach((v, i) => {
        res.push(v)
        if (i < input.length - 1) res.push(1000)
      })
      return formatArray(res)
    },
  },

  {
    name: 'Early Bird Sort',
    description: 'Values less than 20 cut to the front of the line. All others follow in original relative order.',
    cannotBeInput: (input) => {
      const firstNonEarly = input.findIndex(v => v >= 20)
      if (firstNonEarly === -1) return false
      return input.slice(firstNonEarly).some(v => v < 20)
    },
    validator: (input, output) => {
      const early = input.filter((v) => v < 20)
      const late = input.filter((v) => v >= 20)
      return isSameArray([...early, ...late], output)
    },
    expectedOutput: (input) => {
      const early = input.filter((v) => v < 20)
      const late = input.filter((v) => v >= 20)
      return formatArray([...early, ...late])
    },
  },

  {
    name: 'Last Call Sort',
    description: 'It is closing time. Reverse the array and double every value.',
    cannotBeInput: true,
    validator: (input, output) => {
      const expected = [...input].reverse().map((v) => v * 2)
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => formatArray([...input].reverse().map((v) => v * 2)),
  },

  {
    name: 'Midlife Crisis Sort',
    description: 'Trying to be something you are not. Replace every value x with (100 - x).',
    cannotBeInput: true,
    validator: (input, output) => input.every((v, i) => output[i] === 100 - v),
    expectedOutput: (input) => formatArray(input.map((v) => 100 - v)),
  },

  {
    name: 'Burnout Sort',
    description: 'You have nothing left to give. Every element becomes the value of the element to its left; the first becomes 0.',
    cannotBeInput: true,
    validator: (input, output) =>
      output[0] === 0 && input.slice(0, -1).every((v, i) => output[i + 1] === v),
    expectedOutput: (input) =>
      input.length === 0 ? '[]' : formatArray([0, ...input.slice(0, -1)]),
  },

  {
    name: 'Global Warming Sort',
    description: 'The temperature is rising. Every value in the array increases by 1.5.',
    cannotBeInput: true,
    validator: (input, output) =>
      input.every((v, i) => Math.abs(output[i] - (v + 1.5)) < 1e-6),
    expectedOutput: (input) => formatArray(input.map((v) => v + 1.5)),
  },

  {
    name: 'Dementia Sort',
    description: 'You start the array fine, but halfway through you forget what you were doing. The second half of the array must be all zeros.',
    cannotBeInput: (input) => input.slice(Math.floor(input.length / 2)).some(v => v !== 0),
    validator: (input, output) => {
      const half = Math.floor(input.length / 2);
      const firstHalfMatch = isSameArray(input.slice(0, half), output.slice(0, half));
      const secondHalfZero = output.slice(half).every(v => v === 0);
      return firstHalfMatch && secondHalfZero && input.length === output.length;
    },
    expectedOutput: (input) => {
      const half = Math.floor(input.length / 2);
      const res = [...input.slice(0, half), ...new Array(input.length - half).fill(0)];
      return formatArray(res);
    },
  },

  {
    name: 'Podium Sort',
    description: 'Racing logic. Sort descending, but the top three values must be within 1 unit of each other to simulate a close finish.',
    cannotBeInput: true,
    validator: (_input, output) => {
      if (!isSameArray([...output].sort((a, b) => b - a), output)) return false;
      if (output.length < 3) return true;
      return (output[0] - output[1] <= 1) && (output[1] - output[2] <= 1);
    },
    expectedOutput: (input) => {
      const sorted = [...input].sort((a, b) => b - a);
      if (sorted.length >= 2) sorted[1] = sorted[0] - 0.1;
      if (sorted.length >= 3) sorted[2] = sorted[0] - 0.2;
      return formatArray(sorted);
    },
  }, 

  {
    name: 'McDonalds Sort',
    description: 'Nobody is allowed to be paid higher than £15. Anything above 15 is capped at 15.',
    cannotBeInput: (input) => input.some(v => v > 15),
    validator: (input, output) => {
      return input.every((v, i) => output[i] === (v > 15 ? 15 : v));
    },
    expectedOutput: (input) => formatArray(input.map(v => (v > 15 ? 15 : v))),
  },

  {
    name: 'Deepfake Sort',
    description: 'Pretending to be something else. Every number is replaced by the nearest multiple of 10. It looks like the same data, but it’s just a facade.',
    cannotBeInput: (input) => input.some(v => v % 10 !== 0),
    validator: (input, output) => {
      return input.every((v, i) => output[i] === Math.round(v / 10) * 10);
    },
    expectedOutput: (input) => formatArray(input.map(v => Math.round(v / 10) * 10)),
  },

  {
    name: 'Epstein Sort',
    description: 'Sort the list in ascending order and then remove anything over 14.',
    cannotBeInput: (input) => {
      const expected = [...input]
        .sort((a, b) => a - b)
        .filter((v) => v <= 14);
      return !isSameArray(input, expected);
    },
    validator: (input, output) => {
      const expected = [...input]
        .sort((a, b) => a - b)
        .filter((v) => v <= 14);
      return isSameArray(expected, output);
    },
    expectedOutput: (input) => {
      const res = [...input]
        .sort((a, b) => a - b)
        .filter((v) => v <= 14);
      return formatArray(res);
    },
  },

  {
    name: '9/11 Sort',
    description: 'Remove the largest 2 numbers and sort the remaining elements in ascending order.',
    cannotBeInput: (input) => {
      if (input.length <= 2) return input.length > 0;
      const sortedDesc = [...input].sort((a, b) => b - a);
      const expected = sortedDesc.slice(2).sort((a, b) => a - b);
      return !isSameArray(input, expected);
    },
    validator: (input, output) => {
      if (input.length <= 2) return output.length === 0;
      const sortedDesc = [...input].sort((a, b) => b - a);
      const expected = sortedDesc.slice(2).sort((a, b) => a - b);
      return isSameArray(expected, output);
    },
    expectedOutput: (input) => {
      if (input.length <= 2) return '[]';
      const sortedDesc = [...input].sort((a, b) => b - a);
      const remaining = sortedDesc.slice(2).sort((a, b) => a - b);
      return formatArray(remaining);
    },
  },

  {
    name: 'Anxiety Sort',
    description: 'Sort the list in ascending order, then append the sorted list two more times just to be absolutely sure.',
    cannotBeInput: (input) => {
      const sorted = [...input].sort((a, b) => a - b);
      const expected = [...sorted, ...sorted, ...sorted];
      return !isSameArray(input, expected);
    },
    validator: (input, output) => {
      const sorted = [...input].sort((a, b) => a - b);
      const expected = [...sorted, ...sorted, ...sorted];
      return isSameArray(expected, output);
    },
    expectedOutput: (input) => {
      const sorted = [...input].sort((a, b) => a - b);
      const tripleThreat = [...sorted, ...sorted, ...sorted];
      return formatArray(tripleThreat);
    },
  },

  {
    name: 'Ragequit Sort',
    description: 'Check if the list is sorted in ascending order. If it is not, ragequit and return an empty array.',
    cannotBeInput: (input) => {
      // If it's already sorted, there's no "ragequit" to perform.
      // If it's already empty, there's nothing left to delete.
      return isSortedAsc(input) && input.length > 0;
    },
    validator: (input, output) => {
      if (isSortedAsc(input)) {
        return isSameArray(input, output);
      } else {
        return output.length === 0;
      }
    },
    expectedOutput: (input) => {
      if (isSortedAsc(input)) {
        return formatArray(input);
      }
      return '[]';
    },
  },
]

/** Boss stages use multiples of this (8, 16, 24, …). */
export const BOSS_LEVEL_EVERY = 8

export function isBossStageLevel(level: number, every: number = BOSS_LEVEL_EVERY): boolean {
  return level > 0 && level % every === 0
}

/**
 * Ten deliberately harder rules. Validators mirror the spec; hidden tests reuse the same `validator`.
 */
export const BOSS_SORTS: SillySort[] = [
  {
    name: 'Reply All Disaster',
    isBoss: true,
    description:
      'Like an email thread that won\'t die, each person carries the weight of everyone before them. Each position i must be the bitwise XOR sum of all elements from 0 to i.',
    cannotBeInput: true,
    validator: (input, output) => {
      let acc = 0;
      return input.every((v, i) => {
        acc ^= Math.trunc(v);
        return Math.abs(output[i] - acc) < 1e-6;
      });
    },
    expectedOutput: (input) => {
      let acc = 0;
      return formatArray(input.map((v) => (acc ^= Math.trunc(v))));
    },
  },

  {
    name: 'High School Popularity Contest',
    isBoss: true,
    description:
      'Every number is stripped of its value and replaced by its social rank (0 for the biggest loser, $n-1$ for the prom king). If two numbers are equally "cool," the one who arrived at the party first ranks higher.',
    cannotBeInput: (input) => {
        const ranks = [...input].map((v, i) => ({ v, i }))
            .sort((a, b) => a.v - b.v || a.i - b.i)
            .map((_, rank) => rank);
        return !isSameArray(input, ranks);
    },
    validator: (input, output) => {
      const expected = input.map((v, i) => ({ v, i }))
        .sort((a, b) => a.v - b.v || a.i - b.i)
        .map((obj, rank) => ({ ...obj, rank }))
        .sort((a, b) => a.i - b.i)
        .map(o => o.rank);
      return isSameArray(expected, output);
    },
    expectedOutput: (input) => {
      const indexed = input.map((v, i) => ({ v, i }));
      const sorted = [...indexed].sort((a, b) => a.v - b.v || a.i - b.i);
      const result = new Array(input.length);
      sorted.forEach((item, rank) => { result[item.i] = rank; });
      return formatArray(result);
    },
  },

  {
    name: 'Noah\'s Ark Divorce',
    isBoss: true,
    description:
      'The animals are fighting. Move all even-indexed numbers to the left side of the boat and all odd-indexed numbers to the right side, keeping their original social circles (relative order) intact.',
    cannotBeInput: (input) => {
      const evens = input.filter((_, i) => i % 2 === 0);
      const odds = input.filter((_, i) => i % 2 !== 0);
      return !isSameArray(input, [...evens, ...odds]);
    },
    validator: (input, output) => {
      const evens = input.filter((_, i) => i % 2 === 0);
      const odds = input.filter((_, i) => i % 2 !== 0);
      return isSameArray([...evens, ...odds], output);
    },
    expectedOutput: (input) => {
      const evens = input.filter((_, i) => i % 2 === 0);
      const odds = input.filter((_, i) => i % 2 !== 0);
      return formatArray([...evens, ...odds]);
    },
  },

  {
    name: 'IKEA Instruction Manual',
    isBoss: true,
    description:
      'You built it in chunks of 3, but you read the manual backwards. Reverse every group of 3 elements (0-2, 3-5, etc.). If a piece is left over at the end, it stays exactly where it is.',
    cannotBeInput: true,
    validator: (input, output) => {
      const expected: number[] = [];
      for (let i = 0; i < input.length; i += 3) {
        const chunk = input.slice(i, i + 3);
        expected.push(...(chunk.length === 3 ? chunk.reverse() : chunk));
      }
      return isSameArray(expected, output);
    },
    expectedOutput: (input) => {
      const out: number[] = [];
      for (let i = 0; i < input.length; i += 3) {
        const chunk = input.slice(i, i + 3);
        out.push(...(chunk.length === 3 ? chunk.reverse() : chunk));
      }
      return formatArray(out);
    },
  },

  {
    name: 'Toxic Workplace Ego',
    isBoss: true,
    description:
      'The "Running Max" culture. Every employee must act as important as the most important person to their left. If you were a 20 but the guy before you was an 80, you are now an 80.',
    cannotBeInput: (input) => {
      let m = -Infinity;
      return input.some((v) => {
        const oldM = m;
        m = Math.max(m, v);
        return v < oldM;
      });
    },
    validator: (input, output) => {
      let m = -1;
      return input.every((v, i) => {
        m = Math.max(m, v);
        return output[i] === m;
      });
    },
    expectedOutput: (input) => {
      let m = -1;
      return formatArray(input.map((v) => (m = Math.max(m, v))));
    },
  },

  {
    name: 'Narcissistic Mirror Sort',
    isBoss: true,
    description:
      'You only see yourself in others. Every number becomes the average of itself and its "mirror" from the opposite end of the array.',
    cannotBeInput: true,
    validator: (input, output) => {
      const n = input.length;
      return input.every((v, i) => Math.abs(output[i] - (v + input[n - 1 - i]) / 2) < 1e-6);
    },
    expectedOutput: (input) => {
      const n = input.length;
      return formatArray(input.map((v, i) => (v + input[n - 1 - i]) / 2));
    },
  },

  {
    name: 'TSA Security Bin',
    isBoss: true,
    description:
      'Strict liquids rule. Anything under 34 stays in your bag (front), anything between 34 and 67 goes in the bin (middle), and anything over 67 requires a secondary pat-down (back). Original order must be preserved within bins.',
    cannotBeInput: true,
    validator: (input, output) => {
      const bins = [input.filter(v => v < 34), input.filter(v => v >= 34 && v <= 67), input.filter(v => v > 67)];
      return isSameArray([...bins[0], ...bins[1], ...bins[2]], output);
    },
    expectedOutput: (input) => {
      const bins = [input.filter(v => v < 34), input.filter(v => v >= 34 && v <= 67), input.filter(v => v > 67)];
      return formatArray([...bins[0], ...bins[1], ...bins[2]]);
    },
  },

  {
    name: 'Gentrified Neighborhood Sort',
    isBoss: true,
    description:
      'The neighborhood is being renovated. The odd-index houses and even-index houses are being "upgraded" separately. Sort the values at even positions ascending, and the values at odd positions ascending, but keep them in their original even/odd slots.',
    cannotBeInput: true,
    validator: (input, output) => {
      const evens = input.filter((_, i) => i % 2 === 0).sort((a, b) => a - b);
      const odds = input.filter((_, i) => i % 2 !== 0).sort((a, b) => a - b);
      let ei = 0, oi = 0;
      return input.every((_, i) => output[i] === (i % 2 === 0 ? evens[ei++] : odds[oi++]));
    },
    expectedOutput: (input) => {
      const evens = input.filter((_, i) => i % 2 === 0).sort((a, b) => a - b);
      const odds = input.filter((_, i) => i % 2 !== 0).sort((a, b) => a - b);
      let ei = 0, oi = 0;
      return formatArray(input.map((_, i) => (i % 2 === 0 ? evens[ei++] : odds[oi++])));
    },
  },

  {
    name: 'Ponzi Scheme Sort',
    isBoss: true,
    description:
      'Every number is "investing" in the person next to them. Multiply each value by the value of the person to its right. The last person in line is desperate and multiplies their value by the first person in the array.',
    cannotBeInput: (input) => input.length > 1,
    validator: (input, output) => {
      const n = input.length;
      return input.every((v, i) => Math.abs(output[i] - (v * input[(i + 1) % n])) < 1e-6);
    },
    expectedOutput: (input) => {
      const n = input.length;
      return formatArray(input.map((v, i) => v * input[(i + 1) % n]));
    },
  },

  {
    name: 'Blind Date Disaster',
    isBoss: true,
    description:
      'Everyone is paired up (0-1, 2-3, etc.). Each pair is judged as a unit: the "best" couples (based on the first person, then the second) move to the front of the line. If you don\'t have a date (odd length), you wait at the end.',
    cannotBeInput: (input) => input.length >= 2,
    validator: (input, output) => {
      const n = input.length;
      const pairs: [number, number][] = [];
      for (let i = 0; i < Math.floor(n / 2); i++) pairs.push([input[i * 2], input[i * 2 + 1]]);
      pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const expected = pairs.flat();
      if (n % 2 !== 0) expected.push(input[n - 1]);
      return isSameArray(expected, output);
    },
    expectedOutput: (input) => {
      const n = input.length;
      const pairs: [number, number][] = [];
      for (let i = 0; i < Math.floor(n / 2); i++) pairs.push([input[i * 2], input[i * 2 + 1]]);
      pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const res = pairs.flat();
      if (n % 2 !== 0) res.push(input[n - 1]);
      return formatArray(res);
    },
  },
];

export function getRandomBossSort(): SillySort {
  return BOSS_SORTS[Math.floor(Math.random() * BOSS_SORTS.length)]
}

export function pickSortForStage(level: number): SillySort {
  return isBossStageLevel(level) ? getRandomBossSort() : getRandomSillySort()
}

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
