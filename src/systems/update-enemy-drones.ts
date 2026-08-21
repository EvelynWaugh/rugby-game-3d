import { DIFFICULTIES } from '@/constants/difficulty'
import { BULLET_BATTERY_DRAIN, BULLET_HIT_RADIUS, DRONE_DRONE_HIT_RADIUS, PIG_BULLET_SPEED } from '@/constants/game'
import type { Bullet, Drone, EnemyDrone, Particle } from '@/types/game'
import { dist3, rand, uid } from '@/utils/math'

export function updateEnemyDrones({
  enemyDrones,
  drone,
  difficulty,
  ewActive,
  frame,
}: {
  enemyDrones: EnemyDrone[]
  drone: Drone
  difficulty: keyof typeof DIFFICULTIES
  ewActive: boolean
  frame: number
}): { bullets: Bullet[]; droneDamage: number; droneHit: number; sparks: Particle[] } {
  const ds = DIFFICULTIES[difficulty]
  const bullets: Bullet[] = []
  const sparks: Particle[] = []
  let droneDamage = 0
  let droneHit = 0

  for (const e of enemyDrones) {
    if (e.dead) continue

    if (ewActive) {
      if (e.jamOff > 0) { e.jamOff--; e.visible = false; continue }
      if (Math.random() < 0.18) { e.jamOff = Math.floor(3 + Math.random() * 12); e.visible = false; continue }
      e.visible = true
      if (Math.random() < 0.08) {
        const ea = rand(0, Math.PI * 2)
        e.velocity.x += Math.cos(ea) * 0.22
        e.velocity.z += Math.sin(ea) * 0.22
      }
    } else {
      e.visible = true
    }

    const dx = drone.position.x - e.position.x
    const dz = drone.position.z - e.position.z
    const dd = Math.hypot(dx, dz) || 1
    const chase = 0.12 * ds.enemySpeed
    e.velocity.x += (dx / dd) * chase
    e.velocity.z += (dz / dd) * chase
    e.velocity.x *= 0.94
    e.velocity.z *= 0.94
    e.position.x += e.velocity.x
    e.position.z += e.velocity.z
    e.position.y = 8 + Math.sin(frame * 0.05 + e.position.x) * 0.5

    if (dd < DRONE_DRONE_HIT_RADIUS) {
      droneDamage += 0.4
      droneHit = 8
      sparks.push(...createSparks(drone.position))
    }

    e.cool--
    if (e.cool <= 0 && dd < 36) {
      e.cool = rand(60, 120) * ds.enemyRate
      const dy = drone.position.y - e.position.y
      const dist = Math.hypot(dx, dy, dz) || 1
      bullets.push({
        id: uid('bullet'),
        position: { ...e.position },
        velocity: {
          x: (dx / dist) * PIG_BULLET_SPEED,
          y: (dy / dist) * PIG_BULLET_SPEED,
          z: (dz / dist) * PIG_BULLET_SPEED,
        },
        life: 110,
        enemy: true,
      })
    }
  }

  return { bullets, droneDamage, droneHit, sparks }
}

export function updateBullets({
  bullets,
  drone,
}: {
  bullets: Bullet[]
  drone: Drone
}): { droneDamage: number; droneHit: number; sparks: Particle[] } {
  let droneDamage = 0
  let droneHit = 0
  const sparks: Particle[] = []

  for (const b of bullets) {
    b.position.x += b.velocity.x
    b.position.y += b.velocity.y
    b.position.z += b.velocity.z
    b.life--

    if (b.enemy && dist3(b.position, drone.position) < BULLET_HIT_RADIUS) {
      droneDamage += BULLET_BATTERY_DRAIN
      droneHit = 10
      sparks.push(...createSparks(drone.position))
      b.life = 0
    }
  }

  return { droneDamage, droneHit, sparks }
}

function createSparks(position: { x: number; y: number; z: number }): Particle[] {
  const sparks: Particle[] = []
  for (let i = 0; i < 6; i++) {
    const a = rand(0, Math.PI * 2)
    sparks.push({
      id: uid('spark'),
      position: { ...position },
      velocity: { x: Math.cos(a) * rand(0.1, 0.4), y: rand(0.05, 0.2), z: Math.sin(a) * rand(0.1, 0.4) },
      life: rand(8, 16),
      max: 16,
      color: '#ffb347',
      r: rand(0.1, 0.2),
    })
  }
  return sparks
}

export function filterBullets(bullets: Bullet[]) {
  return bullets.filter((b) => b.life > 0)
}
