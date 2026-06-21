import { EXPLOSION_RADIUS, EXPLOSION_RADIUS_RED, SCORE, SHELTER_EXPLOSION_DAMAGE } from '@/constants/game'
import { markSoldierDead } from '@/systems/soldier-death'
import type { EnemyDrone, EwTower, Shelter, Soldier } from '@/types/game'
import { distXZ } from '@/utils/math'

export function applyExplosionDamage({
  x,
  z,
  soldiers,
  shelters,
  enemyDrones,
  ewTowers,
}: {
  x: number
  z: number
  soldiers: Soldier[]
  shelters: Shelter[]
  enemyDrones: EnemyDrone[]
  ewTowers: EwTower[]
}): number {
  let scoreDelta = 0
  const center = { x, y: 0.5, z }

  for (const s of soldiers) {
    if (s.dead || s.immune) continue
    const dd = distXZ(center, s.position)
    const hitR = s.pig ? EXPLOSION_RADIUS : EXPLOSION_RADIUS_RED
    if (dd >= hitR) continue

    if (s.pig) {
      const dmg = dd < hitR * 0.45 ? 2 : 1
      s.hp -= dmg
    } else {
      s.hp = 0
    }

    if (s.hp <= 0) {
      markSoldierDead(s, 'shot')
      scoreDelta += s.pig ? SCORE.pigExplosion : SCORE.redSoldier
    }
  }

  for (const e of enemyDrones) {
    if (e.dead || e.immune) continue
    if (distXZ(center, e.position) < EXPLOSION_RADIUS) {
      e.dead = true
      scoreDelta += SCORE.enemyDrone
    }
  }

  for (const sh of shelters) {
    if (sh.dead) continue
    const halfW = sh.w / 2 + 1.5
    const halfH = sh.h / 2 + 1.5
    if (
      x > sh.position.x - halfW &&
      x < sh.position.x + halfW &&
      z > sh.position.z - halfH &&
      z < sh.position.z + halfH
    ) {
      sh.hp -= SHELTER_EXPLOSION_DAMAGE
      if (sh.hp <= 0) {
        sh.dead = true
        for (const rat of sh.rats) rat.dead = true
        scoreDelta += sh.command ? SCORE.commandShelter : SCORE.shelter
      }
    }
  }

  for (const t of ewTowers) {
    if (t.dead || t.immune) continue
    if (distXZ(center, t.position) < 20) {
      t.hp -= 30
      if (t.hp <= 0) {
        t.dead = true
        scoreDelta += SCORE.ewTower
      }
    }
  }

  return scoreDelta
}

export function findShelterProximityDetonation({
  x,
  z,
  shelters,
}: {
  x: number
  z: number
  shelters: Shelter[]
}): boolean {
  for (const sh of shelters) {
    if (sh.dead) continue
    const halfW = sh.w / 2 + 1
    const halfH = sh.h / 2 + 1
    if (
      x > sh.position.x - halfW &&
      x < sh.position.x + halfW &&
      z > sh.position.z - halfH &&
      z < sh.position.z + halfH
    ) return true
  }

  return false
}
