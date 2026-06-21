import { MUNITION_FALL_RATE, MUNITION_FALL_RATE_BIG } from '@/constants/game'
import { findShelterProximityDetonation } from '@/systems/combat-hit'
import type { Drone, Munition, Shelter, Smoke, Soldier, Wind } from '@/types/game'
import { rand, uid } from '@/utils/math'

export function dropMunition(drone: Drone): Munition | null {
  if (drone.munitions <= 0 && !drone.hasBigBall) return null

  const isBigBall = drone.hasBigBall
  if (isBigBall) drone.hasBigBall = false
  else drone.munitions--

  const inherit = isBigBall ? 0.55 : 0.4
  const dropHeight = Math.max(drone.position.y, 6)

  return {
    id: uid('muni'),
    position: { ...drone.position },
    velocity: {
      x: drone.velocity.x * inherit,
      y: 0,
      z: drone.velocity.z * inherit,
    },
    alt: 1,
    groundX: drone.position.x,
    groundZ: drone.position.z,
    dropHeight,
    rot: rand(0, Math.PI * 2),
    spin: rand(isBigBall ? 0.08 : 0.15, isBigBall ? 0.15 : 0.25),
    isBigBall,
    done: false,
  }
}

export function updateMunitions({
  munitions,
  shelters,
  wind,
}: {
  munitions: Munition[]
  soldiers: Soldier[]
  shelters: Shelter[]
  wind: Wind
}): { smoke: Smoke[]; impacts: Munition[] } {
  const smoke: Smoke[] = []
  const impacts: Munition[] = []

  for (const m of munitions) {
    if (m.done) continue

    const dropHeight = m.dropHeight || 12
    m.alt -= m.isBigBall ? MUNITION_FALL_RATE_BIG : MUNITION_FALL_RATE
    m.velocity.x += wind.x * 0.04
    m.velocity.z += wind.z * 0.02
    m.position.x += m.velocity.x
    m.position.z += m.velocity.z
    m.groundX = m.position.x
    m.groundZ = m.position.z
    m.position.y = Math.max(0.35, m.alt * dropHeight)
    m.rot += m.spin

    const nearShelter = m.alt < 0.45 && findShelterProximityDetonation({
      x: m.position.x,
      z: m.position.z,
      shelters,
    })

    if (m.alt <= 0 || nearShelter) {
      m.done = true
      m.position.y = 0.35
      impacts.push(m)
    }
  }

  return { smoke, impacts }
}
