import { applyExplosionDamage } from '@/systems/combat-hit'
import type { Particle } from '@/types/game'

export function checkExplosion(hit: Parameters<typeof applyExplosionDamage>[0]) {
  const scoreDelta = applyExplosionDamage(hit)
  return { scoreDelta, shake: scoreDelta > 0 ? 1.8 : 1.1 }
}

export function updateParticles(particles: Particle[]) {
  for (const p of particles) {
    p.position.x += p.velocity.x
    p.position.y += p.velocity.y
    p.position.z += p.velocity.z
    p.velocity.x *= 0.95
    p.velocity.y *= 0.95
    p.velocity.z *= 0.95
    p.life--
  }
  return particles.filter((p) => p.life > 0)
}
