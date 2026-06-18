import { DIFFICULTIES } from '@/constants/difficulty'
import { RAM_DAMAGE, RAM_RADIUS, SOLDIER_SHOOT_RANGE_SQ } from '@/constants/game'
import type { Bullet, Drone, Munition, Soldier } from '@/types/game'
import { dist3, distXZ, rand, uid } from '@/utils/math'

const ENEMY_MARGIN = 3.6

function clampEnemyPosition(s: Soldier) {
  if (s.position.x < -ENEMY_MARGIN) { s.position.x = -ENEMY_MARGIN; s.velocity.x = Math.abs(s.velocity.x || 0.1) }
  if (s.position.x > ENEMY_MARGIN + 60) { s.position.x = ENEMY_MARGIN + 60; s.velocity.x = -Math.abs(s.velocity.x || 0.1) }
  if (s.position.z < -500) { s.position.z = -500; s.velocity.z = Math.abs(s.velocity.z || 0.1) }
  if (s.position.z > ENEMY_MARGIN) { s.position.z = ENEMY_MARGIN; s.velocity.z = -Math.abs(s.velocity.z || 0.1) }
}

export interface SoldierUpdateResult {
  bullets: Bullet[]
  ramKills: Soldier[]
  scoreDelta: number
  droneDamage: number
  droneHit: number
}

export function updateSoldiers({
  soldiers,
  drone,
  munitions,
  difficulty,
  ewActive,
}: {
  soldiers: Soldier[]
  drone: Drone
  munitions: Munition[]
  difficulty: keyof typeof DIFFICULTIES
  ewActive: boolean
}): SoldierUpdateResult {
  const ds = DIFFICULTIES[difficulty]
  const bullets: Bullet[] = []
  const ramKills: Soldier[] = []
  let scoreDelta = 0
  let droneDamage = 0
  let droneHit = 0

  for (const s of soldiers) {
    if (s.dead) continue

    if (ewActive) {
      if (s.jamOff > 0) { s.jamOff--; s.visible = false; continue }
      if (Math.random() < 0.15) { s.jamOff = Math.floor(2 + Math.random() * 9); s.visible = false; continue }
      s.visible = true
    } else {
      s.visible = true
    }

    s.position.x += s.velocity.x * 0.1
    s.position.z += s.velocity.z * 0.1
    clampEnemyPosition(s)

    const dToDrone = dist3(drone.position, s.position)
    if (s.pig && !s.immune && dToDrone < RAM_RADIUS) {
      s.dead = true
      ramKills.push(s)
      scoreDelta += 300
      droneDamage += RAM_DAMAGE
      droneHit = 8
      continue
    }

    const erratic = s.pig ? 0.04 : 0.01
    const spd = s.pig ? 0.9 : 0.6
    if (Math.random() < erratic) {
      s.velocity.x = rand(-spd, spd)
      s.velocity.z = rand(-spd, spd)
    }

    if (s.pig) {
      let flee = false
      for (const m of munitions) {
        if (m.alt < 0.4 && distXZ(s.position, m.position) < 9) {
          const dx = s.position.x - m.position.x
          const dz = s.position.z - m.position.z
          const dd = Math.hypot(dx, dz) || 1
          s.velocity.x = (dx / dd) * 1.6
          s.velocity.z = (dz / dd) * 1.6
          s.behavior = 'flee'
          flee = true
        }
      }
      if (!flee && dToDrone < 12) {
        s.behavior = 'flee'
        const dx = s.position.x - drone.position.x
        const dz = s.position.z - drone.position.z
        const dd = Math.hypot(dx, dz) || 1
        s.velocity.x = (dx / dd) * 1.2
        s.velocity.z = (dz / dd) * 1.2
      } else if (!flee) {
        s.behavior = 'biped'
      }
    }

    s.cool--
    if (s.cool <= 0) {
      s.cool = rand(70, 160) * ds.enemyRate
      const dx = drone.position.x - s.position.x
      const dz = drone.position.z - s.position.z
      const dd = dx * dx + dz * dz
      if (dd < SOLDIER_SHOOT_RANGE_SQ) {
        const dist = Math.sqrt(dd) || 1
        bullets.push({
          id: uid('bullet'),
          position: { ...s.position, y: s.position.y + 1 },
          velocity: { x: (dx / dist) * 0.4, y: 0, z: (dz / dist) * 0.4 },
          life: 120,
          enemy: true,
        })
      }
    }
  }

  return { bullets, ramKills, scoreDelta, droneDamage, droneHit }
}
