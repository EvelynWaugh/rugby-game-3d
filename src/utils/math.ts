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

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
