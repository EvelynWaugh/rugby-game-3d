import { DIFFICULTIES } from '@/constants/difficulty'
import { markSoldierDead } from '@/systems/soldier-death'
import { RAM_DAMAGE, RAM_RADIUS, RAM_RADIUS_3D, SCORE, SOLDIER_SHOOT_RANGE_SQ } from '@/constants/game'
import type { Bullet, Drone, Munition, Soldier } from '@/types/game'
import { dist3, distXZ, rand, uid } from '@/utils/math'

const LEASH_RADIUS = 14

function leashToSpawn(s: Soldier) {
  const anchor = s.spawnPosition
  const dx = s.position.x - anchor.x
  const dz = s.position.z - anchor.z
  const dist = Math.hypot(dx, dz)
  if (dist <= LEASH_RADIUS) return

  const pull = (dist - LEASH_RADIUS) * 0.08
  s.position.x -= (dx / dist) * pull
  s.position.z -= (dz / dist) * pull
  s.velocity.x *= 0.85
  s.velocity.z *= 0.85
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
    leashToSpawn(s)

    const horiz = distXZ(drone.position, s.position)
    const close3d = dist3(drone.position, s.position)
    if (s.pig && !s.immune && (horiz < RAM_RADIUS || close3d < RAM_RADIUS_3D)) {
      markSoldierDead(s, 'abdominal')
      ramKills.push(s)
      scoreDelta += SCORE.pigRam
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
      if (!flee && horiz < 14) {
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
        s.behavior = 'aim'
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
