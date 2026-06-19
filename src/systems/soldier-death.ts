import { PIG_DEATH_FRAMES } from '@/constants/models'
import type { DeathVariant, Soldier } from '@/types/game'

export function markSoldierDead(soldier: Soldier, variant: DeathVariant) {
  if (soldier.dead) return
  soldier.dead = true
  soldier.deathVariant = variant
  soldier.deathTimer = PIG_DEATH_FRAMES
  soldier.behavior = 'biped'
}

export function tickSoldierDeathTimers(soldiers: Soldier[]) {
  for (const s of soldiers) {
    if (s.dead && s.deathTimer > 0) s.deathTimer--
  }
}
