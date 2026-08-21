import { RAT_WALK_SPEED } from '@/constants/game'
import { SHELTER_INTERIOR_RATIO } from '@/constants/models'
import type { Shelter } from '@/types/game'
import { clamp } from '@/utils/math'

function interiorHalf({ w, d }: Shelter) {
  return {
    halfX: (w / 2) * SHELTER_INTERIOR_RATIO,
    halfZ: (d / 2) * SHELTER_INTERIOR_RATIO,
  }
}

function bounceInBounds({
  pos,
  vel,
  limit,
}: {
  pos: number
  vel: number
  limit: number
}) {
  if (pos > limit) return { pos: limit, vel: -Math.abs(vel) }
  if (pos < -limit) return { pos: -limit, vel: Math.abs(vel) }
  return { pos, vel }
}

export function updateRats({ shelters }: { shelters: Shelter[] }) {
  for (const shelter of shelters) {
    const { halfX, halfZ } = interiorHalf(shelter)

    for (const rat of shelter.rats) {
      if (rat.dead || shelter.dead) {
        rat.vx = 0
        rat.vz = 0
        continue
      }

      if (Math.random() < 0.012) {
        const angle = Math.random() * Math.PI * 2
        rat.vx = Math.sin(angle) * RAT_WALK_SPEED
        rat.vz = Math.cos(angle) * RAT_WALK_SPEED
      }

      rat.ox += rat.vx
      rat.oz += rat.vz

      const xHit = bounceInBounds({ pos: rat.ox, vel: rat.vx, limit: halfX })
      rat.ox = xHit.pos
      rat.vx = xHit.vel

      const zHit = bounceInBounds({ pos: rat.oz, vel: rat.vz, limit: halfZ })
      rat.oz = zHit.pos
      rat.vz = zHit.vel

      rat.ox = clamp(rat.ox, -halfX, halfX)
      rat.oz = clamp(rat.oz, -halfZ, halfZ)
    }
  }
}
