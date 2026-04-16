import type { SillySort } from './sillySorts'
import { mulberry32 } from './prng'

export type InputMutator = {
  id: string
  name: string
  description: string
  apply: (input: number[]) => number[]
}

export const MUTATORS: InputMutator[] = [
  {
    id: 'gravity-well',
    name: 'Gravity Well',
    description: 'Shift values so the minimum becomes 0 (subtract min from every element).',
    apply: (input) => {
      if (input.length === 0) return []
      const mn = Math.min(...input)
      return input.map((v) => v - mn)
    },
  },
  {
    id: 'inflation',
    name: 'Inflation',
    description: 'Add 5 to every element before applying the rule.',
    apply: (input) => input.map((v) => v + 5),
  },
  {
    id: 'mirror-world',
    name: 'Mirror World',
    description: 'Multiply every element by -1 before applying the rule.',
    apply: (input) => input.map((v) => -v),
  },
  {
    id: 'mod-fog',
    name: 'Modulo Fog',
    description: 'Replace each value with abs(value) % 10 before applying the rule.',
    apply: (input) => input.map((v) => Math.abs(v) % 10),
  },
  {
    id: 'clamp-zone',
    name: 'Clamp Zone',
    description: 'Clamp each value into the range [0, 50] before applying the rule.',
    apply: (input) => input.map((v) => Math.max(0, Math.min(50, v))),
  },
]

export function pickMutatorForLevel(level: number, seed: number) {
  const rng = mulberry32((seed ^ (level * 0x85ebca6b)) >>> 0)
  return MUTATORS[Math.floor(rng() * MUTATORS.length)]!
}

export function applyMutatorToSort(base: SillySort, mutator: InputMutator): SillySort {
  return {
    ...base,
    name: `${base.name} + ${mutator.name}`,
    description: `${base.description} Mutator: ${mutator.description}`,
    inputTransform: mutator.apply,
  }
}

