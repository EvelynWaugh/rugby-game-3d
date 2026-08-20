import { applyExplosionDamage } from '@/systems/combat-hit'
import type {
  EnemyDrone,
  EwTower,
  Particle,
  PigPart,
  Shelter,
  Smoke,
  Soldier,
  Vec3,
} from '@/types/game'
import { rand, uid } from '@/utils/math'

export interface ExplosionResult {
  big: boolean
  scoreDelta: number
  shake: number
  particles: Particle[]
  smoke: Smoke[]
  pigParts: PigPart[]
  pigSplatPositions: Vec3[]
}

export function checkExplosion({
  x,
  z,
  soldiers,
  shelters,
  enemyDrones,
  ewTowers,
  forceBig = false,
}: {
  x: number
  z: number
  soldiers: Soldier[]
  shelters: Shelter[]
  enemyDrones: EnemyDrone[]
  ewTowers: EwTower[]
  forceBig?: boolean
}): ExplosionResult {
  const scoreDelta = applyExplosionDamage({
    x,
    z,
    soldiers,
    shelters,
    enemyDrones,
    ewTowers,
  })

  let big = forceBig || scoreDelta > 0
  const pigSplatPositions: Vec3[] = []
  for (const s of soldiers) {
    if (s.dead && s.deathTimer > 130) {
      pigSplatPositions.push({ ...s.position })
    }
  }

  const center: Vec3 = { x, y: 0.5, z }
  const fx = createExplosionFx(center, big)
  for (const pos of pigSplatPositions) {
    const splat = createPigSplatFx(pos)
    fx.particles.push(...splat.particles)
    fx.smoke.push(...splat.smoke)
    fx.pigParts.push(...splat.pigParts)
    fx.shake = Math.max(fx.shake, splat.shake)
  }

  return { ...fx, big, scoreDelta, pigSplatPositions }
}

export function createExplosionFx(position: Vec3, big: boolean): ExplosionResult {
  const n = big ? 40 : 22
  const particles: Particle[] = []
  const smoke: Smoke[] = []

  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2)
    const s = rand(0.1, big ? 0.7 : 0.5)
    particles.push({
      id: uid('particle'),
      position: { ...position },
      velocity: { x: Math.cos(a) * s, y: rand(0.1, 0.5), z: Math.sin(a) * s },
      life: rand(20, 45),
      max: 45,
      color: Math.random() < 0.5 ? '#ff9a3c' : '#ffd86b',
      r: rand(0.2, big ? 0.6 : 0.4),
    })
  }

  for (let i = 0; i < 8; i++) {
    smoke.push({
      id: uid('smoke'),
      position: {
        x: position.x + rand(-1, 1),
        y: position.y + rand(0, 1),
        z: position.z + rand(-1, 1),
      },
      velocity: { x: rand(-0.05, 0.05), y: rand(0.05, 0.1), z: rand(-0.05, 0.05) },
      life: rand(30, 60),
      max: 60,
      r: rand(0.8, 1.8),
    })
  }

  return { big, scoreDelta: 0, shake: big ? 1.6 : 0.8, particles, smoke, pigParts: [], pigSplatPositions: [] }
}

export function createPigSplatFx(position: Vec3): Pick<ExplosionResult, 'shake' | 'particles' | 'smoke' | 'pigParts'> {
  const ba = rand(0, Math.PI * 2)
  const pigParts: PigPart[] = [
    {
      id: uid('part'),
      position: { ...position },
      velocity: { x: Math.cos(ba) * 0.3, y: 0.2, z: Math.sin(ba) * 0.3 },
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.18, 0.18),
      life: 55,
      max: 55,
      type: 'body',
    },
  ]
  const particles: Particle[] = []

  for (let i = 0; i < 12; i++) {
    const a = rand(0, Math.PI * 2)
    const sp = rand(0.15, 0.55)
    particles.push({
      id: uid('particle'),
      position: { ...position },
      velocity: { x: Math.cos(a) * sp, y: rand(0.1, 0.3), z: Math.sin(a) * sp },
      life: rand(15, 40),
      max: 40,
      color: Math.random() < 0.5 ? '#FF69B4' : '#FF1493',
      r: rand(0.15, 0.45),
    })
  }

  return { shake: 1.4, particles, smoke: [], pigParts }
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

export function updateSmoke(smoke: Smoke[]) {
  for (const s of smoke) {
    s.position.x += s.velocity.x
    s.position.y += s.velocity.y
    s.position.z += s.velocity.z
    s.life--
    s.r *= 1.01
  }
  return smoke.filter((s) => s.life > 0)
}

export function updatePigParts(pigParts: PigPart[]) {
  for (const pp of pigParts) {
    pp.position.x += pp.velocity.x
    pp.position.y += pp.velocity.y
    pp.position.z += pp.velocity.z
    pp.velocity.x *= 0.93
    pp.velocity.z *= 0.93
    pp.velocity.y -= 0.01
    pp.rot += pp.spin
    pp.life--
  }
  return pigParts.filter((pp) => pp.life > 0)
}
