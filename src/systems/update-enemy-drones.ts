import { DIFFICULTIES } from '@/constants/difficulty'
import { BULLET_BATTERY_DRAIN, BULLET_HIT_RADIUS, NET_HOLD_TICKS } from '@/constants/game'
import type { Bullet, CargoNet, Drone, EnemyDrone, Particle } from '@/types/game'
import { clamp, distPointToSegment, rand, uid } from '@/utils/math'

export function updateEnemyDrones({
  enemyDrones, cargoNets, drone, difficulty, frame,
}: {
  enemyDrones: EnemyDrone[]
  cargoNets: CargoNet[]
  drone: Drone
  difficulty: keyof typeof DIFFICULTIES
  frame: number
}) {
  const ds = DIFFICULTIES[difficulty]
  for (const enemy of enemyDrones) {
    if (enemy.dead) continue
    const dx = drone.position.x - enemy.position.x
    const dz = drone.position.z - enemy.position.z
    const distance = Math.hypot(dx, dz)
    const nearby = distance < 38
    const speed = Math.min(distance * 0.035, 0.11 * ds.enemySpeed)
    enemy.velocity.x = nearby ? dx / (distance || 1) * speed : 0
    enemy.velocity.z = nearby ? dz / (distance || 1) * speed : 0
    enemy.position.x += enemy.velocity.x
    enemy.position.z += enemy.velocity.z
    const hover = (nearby ? drone.position.y + 3.5 : 9) + Math.sin(frame * 0.045) * 0.16
    enemy.position.y += clamp(hover - enemy.position.y, -0.095, 0.095)
    enemy.cool--
    const height = enemy.position.y - drone.position.y
    if (enemy.cool > 0 || distance > 4 || height < 2 || height > 6 || drone.netTicks > 0) continue
    cargoNets.push({
      id: uid('net'), ticks: 45,
      position: { ...enemy.position, y: enemy.position.y - 0.65 },
      velocity: { x: dx / 22, y: -(height - 0.65) / 22, z: dz / 22 },
    })
    enemy.cool = 300 + 80 * ds.enemyRate
  }

  return cargoNets.filter(net => {
    const from = { ...net.position }
    net.position.x += net.velocity.x
    net.position.y += net.velocity.y
    net.position.z += net.velocity.z
    net.ticks--
    if (distPointToSegment(drone.position, from, net.position) < 0.85) {
      if (drone.netTicks === 0) {
        drone.netTicks = NET_HOLD_TICKS
        drone.entranceTicks = 0
        drone.velocity = { x: 0, y: 0, z: 0 }
      }
      return false
    }
    return net.ticks > 0 && net.position.y > 0
  })
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
    const from = { x: b.position.x, y: b.position.y, z: b.position.z }
    b.position.x += b.velocity.x
    b.position.y += b.velocity.y
    b.position.z += b.velocity.z
    b.life--

    if (b.enemy && distPointToSegment(drone.position, from, b.position) < BULLET_HIT_RADIUS) {
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
