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
      const expected = input.map((_, i) => (i % 2 === 0 ? asc[i >> 1] : desc[i >> 1]))
      // actually interleave: position 0 from asc[0], position 1 from desc[0], etc.
      const result: number[] = []
      for (let i = 0; i < input.length; i++)
        result.push(i % 2 === 0 ? asc[Math.floor(i / 2)] : desc[Math.floor(i / 2)])
      return !isSameArray(input, result)
    },
    validator: (_input, output) => {
      const asc = [...output].sort((a, b) => a - b)
      const desc = [...output].sort((a, b) => b - a)
      // Reconstruct what the clown output should look like given these elements
      // It's valid if output[i] matches the pattern
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
    description: 'Every value increases by 1 to account for economic shifts.',
    cannotBeInput: true,
    validator: (input, output) =>
      input.length === output.length && input.every((v, i) => output[i] === v + 1),
    expectedOutput: (input) => formatArray(input.map((v) => v + 1)),
  },

  {
    name: 'Pessimist Sort',
    description: 'Replace every element with the minimum value of the array.',
    cannotBeInput: (input) => {
      if (input.length === 0) return false
      const mn = Math.min(...input)
      return input.some((v) => v !== mn)
    },
    validator: (input, output) => {
      const mn = Math.min(...input)
      return output.length === input.length && output.every((v) => v === mn)
    },
    expectedOutput: (input) => {
      const mn = Math.min(...input)
      return formatArray(input.map(() => mn))
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
    description: 'Replace the second half of the array with a exact copy of the first half.',
    cannotBeInput: (input) => {
      const half = Math.floor(input.length / 2)
      const first = input.slice(0, half)
      const second = input.slice(input.length - half)
      return !isSameArray(first, second)
    },
    validator: (input, output) => {
      const half = Math.floor(input.length / 2)
      const firstHalf = output.slice(0, half)
      const secondHalf = output.slice(output.length - half)
      return isSameArray(firstHalf, secondHalf) && output.length === input.length
    },
    expectedOutput: (input) => {
      const half = Math.floor(input.length / 2)
      const first = input.slice(0, half)
      const result = [...input]
      for (let i = 0; i < half; i++) {
        result[input.length - half + i] = first[i]
      }
      return formatArray(result)
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
    description: 'The first element is replaced with 999,999 to grab attention. The rest remain unchanged.',
    cannotBeInput: (input) => input.length > 0 && input[0] !== 999999,
    validator: (input, output) =>
      output.length === input.length && output[0] === 999999 && isSameArray(input.slice(1), output.slice(1)),
    expectedOutput: (input) =>
      input.length === 0 ? '[]' : formatArray([999999, ...input.slice(1)]),
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
    description: 'Each element becomes the sum of itself and all previous elements (Prefix Sum).',
    cannotBeInput: (input) => {
        if (input.length <= 1) return false;
        return input[1] !== (input[0] + input[1]); // Simple check for first transition
    },
    validator: (input, output) => {
      let sum = 0
      return input.every((v, i) => {
        sum += v
        return output[i] === sum
      })
    },
    expectedOutput: (input) => {
      let sum = 0
      return formatArray(input.map((v) => (sum += v)))
    },
  },

  {
    name: 'Privacy Sort',
    description: 'Redact all information. Replace every element with -1.',
    cannotBeInput: (input) => input.some((v) => v !== -1),
    validator: (_input, output) => output.every((v) => v === -1),
    expectedOutput: (input) => formatArray(input.map(() => -1)),
  },

  {
    name: 'Speed Limit Sort',
    description: 'Any value exceeding 70 is "pulled over" and reduced to 70.',
    cannotBeInput: (input) => input.some((v) => v > 70),
    validator: (input, output) =>
      input.every((v, i) => output[i] === (v > 70 ? 70 : v)),
    expectedOutput: (input) => formatArray(input.map((v) => (v > 70 ? 70 : v))),
  },

  {
    name: 'Small Talk Sort',
    description: 'The values are irrelevant. Replace every element with its index in the array.',
    cannotBeInput: (input) => input.some((v, i) => v !== i),
    validator: (input, output) =>
      output.length === input.length && output.every((v, i) => v === i),
    expectedOutput: (input) => formatArray(input.map((_, i) => i)),
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
    description: 'The highest value is cut down. Replace the maximum value with the second-highest value in the array.',
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
      const expected = input.map((v) => (v === mx ? second : v))
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => {
      const sortedUnique = [...new Set(input)].sort((a, b) => b - a)
      const mx = sortedUnique[0]
      const second = sortedUnique[1] ?? mx
      return formatArray(input.map((v) => (v === mx ? second : v)))
    },
  },

  {
    name: 'Black Friday Sort',
    description: 'Everything is 50% off! Every value is halved and rounded down.',
    cannotBeInput: true,
    validator: (input, output) =>
      input.length === output.length && input.every((v, i) => output[i] === Math.floor(v / 2)),
    expectedOutput: (input) => formatArray(input.map((v) => Math.floor(v / 2))),
  },

  {
    name: 'Nepotism Sort',
    description: 'The first three elements are replaced with the highest value in the array to give them a head start.',
    cannotBeInput: (input) => {
      if (input.length < 3) return false
      const mx = Math.max(...input)
      return input[0] !== mx || input[1] !== mx || input[2] !== mx
    },
    validator: (input, output) => {
      const mx = Math.max(...input)
      const expected = [...input]
      for (let i = 0; i < Math.min(input.length, 3); i++) expected[i] = mx
      return isSameArray(expected, output)
    },
    expectedOutput: (input) => {
      const mx = Math.max(...input)
      const res = [...input]
      for (let i = 0; i < Math.min(input.length, 3); i++) res[i] = mx
      return formatArray(res)
    },
  },

  {
    name: 'Bouncer Sort',
    description: 'Only even numbers are on the list. Replace all odd numbers with 0.',
    cannotBeInput: (input) => input.some((v) => v % 2 !== 0),
    validator: (input, output) =>
      input.every((v, i) => output[i] === (v % 2 === 0 ? v : 0)),
    expectedOutput: (input) => formatArray(input.map((v) => (v % 2 === 0 ? v : 0))),
  },

  {
    name: 'Tax Bracket Sort',
    description: 'High earners pay more. If a value is > 70, subtract 20. If > 40, subtract 10.',
    cannotBeInput: true,
    validator: (input, output) => {
      const calc = (v: number) => (v > 70 ? v - 20 : v > 40 ? v - 10 : v)
      return input.every((v, i) => output[i] === calc(v))
    },
    expectedOutput: (input) =>
      formatArray(input.map((v) => (v > 70 ? v - 20 : v > 40 ? v - 10 : v))),
  },

  {
    name: 'One-Star Review Sort',
    description: 'Total disappointment. Replace every single element with 1.',
    cannotBeInput: (input) => input.some((v) => v !== 1),
    validator: (_input, output) => output.every((v) => v === 1),
    expectedOutput: (input) => formatArray(input.map(() => 1)),
  },

  {
    name: 'Generational Wealth Sort',
    description: 'Success compounds over time. Add (index * 10) to every element.',
    cannotBeInput: true,
    validator: (input, output) => input.every((v, i) => output[i] === v + i * 10),
    expectedOutput: (input) => formatArray(input.map((v, i) => v + i * 10)),
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
    description: 'Trying to be something you are not. Replace every value $x$ with $(100 - x)$.',
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
  }

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
