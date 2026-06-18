import { MUNITION_FALL_RATE, MUNITION_FALL_RATE_BIG } from '@/constants/game'
import type { Drone, Munition, Smoke, Wind } from '@/types/game'
import { rand, uid } from '@/utils/math'

export function dropMunition(drone: Drone): Munition | null {
  if (drone.hasBigBall) {
    drone.hasBigBall = false
    return {
      id: uid('muni'),
      position: { ...drone.position },
      velocity: {
        x: drone.velocity.x * 0.55,
        y: 0,
        z: drone.velocity.z * 0.55,
      },
      alt: 1,
      groundX: drone.position.x,
      groundZ: drone.position.z,
      rot: rand(0, Math.PI * 2),
      spin: rand(0.08, 0.15),
      isBigBall: true,
      done: false,
    }
  }

  if (drone.munitions <= 0) return null

  drone.munitions--
  return {
    id: uid('muni'),
    position: { ...drone.position },
    velocity: {
      x: drone.velocity.x * 0.4,
      y: 0,
      z: drone.velocity.z * 0.4,
    },
    alt: 1,
    groundX: drone.position.x,
    groundZ: drone.position.z,
    rot: rand(0, Math.PI * 2),
    spin: rand(0.15, 0.25),
    isBigBall: false,
    done: false,
  }
}

export function updateMunitions({
  munitions,
  wind,
  frame,
}: {
  munitions: Munition[]
  wind: Wind
  frame: number
}): { smoke: Smoke[]; impacts: Munition[] } {
  const smoke: Smoke[] = []
  const impacts: Munition[] = []

  for (const m of munitions) {
    if (m.done) continue

    m.alt -= m.isBigBall ? MUNITION_FALL_RATE_BIG : MUNITION_FALL_RATE
    m.velocity.x += wind.x * 0.03
    m.position.x += m.velocity.x
    m.position.z += m.velocity.z
    m.groundX = m.position.x
    m.groundZ = m.position.z
    m.position.y = m.alt * 30 + 0.5
    m.rot += m.spin + Math.abs(wind.x) * 0.04

    if (frame % 2 === 0) {
      smoke.push({
        id: uid('smoke'),
        position: { ...m.position },
        velocity: { x: 0, y: 0, z: 0 },
        life: 20,
        max: 20,
        r: m.alt * (m.isBigBall ? 1.4 : 0.8) + 0.2,
      })
    }

    if (m.alt <= 0) {
      m.done = true
      impacts.push(m)
    }
  }

  return { smoke, impacts }
}
