import { BOSS_LEVEL_EVERY, isBossStageLevel } from './sillySorts'

export const MUTATOR_LEVEL_EVERY = 5

export type StageType = 'normal' | 'mutator' | 'boss'

export function isMutatorStageLevel(
  level: number,
  every: number = MUTATOR_LEVEL_EVERY,
  bossEvery: number = BOSS_LEVEL_EVERY,
) {
  if (level <= 0) return false
  if (isBossStageLevel(level, bossEvery)) return false
  return level % every === 0
}

export function getStageType(level: number): StageType {
  if (isBossStageLevel(level)) return 'boss'
  if (isMutatorStageLevel(level)) return 'mutator'
  return 'normal'
}

