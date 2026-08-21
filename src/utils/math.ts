import type { Vec3 } from '@/types/game'

export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function dist3(a: Vec3, b: Vec3): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  return Math.hypot(dx, dy, dz)
}

export function distXZ(a: Vec3, b: Vec3): number {
  const dx = b.x - a.x
  const dz = b.z - a.z
  return Math.hypot(dx, dz)
}

/** Closest distance from point `p` to the segment `a` → `b`. */
export function distPointToSegment(p: Vec3, a: Vec3, b: Vec3): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const abz = b.z - a.z
  const lenSq = abx * abx + aby * aby + abz * abz
  if (lenSq < 1e-8) return dist3(p, a)

  const t = clamp(((p.x - a.x) * abx + (p.y - a.y) * aby + (p.z - a.z) * abz) / lenSq, 0, 1)
  return Math.hypot(p.x - (a.x + abx * t), p.y - (a.y + aby * t), p.z - (a.z + abz * t))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
