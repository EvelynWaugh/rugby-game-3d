import * as THREE from 'three'
import { EXPLOSION_RADIUS } from '@/constants/game'
import { getLevelPath } from '@/systems/path-system'

function hash01(index: number, salt: number) {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

interface ScatterSpec {
  count: number
  sideMin: number
  sideMax: number
  t0?: number
  t1?: number
  scaleJitter?: number
  y?: number
}

export function scatterAlongPath({
  curve,
  spec,
  salt,
}: {
  curve: THREE.CatmullRomCurve3
  spec: ScatterSpec
  salt: number
}) {
  const t0 = spec.t0 ?? 0.05
  const t1 = spec.t1 ?? 0.98
  const up = new THREE.Vector3(0, 1, 0)
  const items: { position: [number, number, number]; rotation: [number, number, number]; scale: number }[] = []

  for (let i = 0; i < spec.count; i++) {
    const t = t0 + ((i + 0.35) / Math.max(spec.count, 1)) * (t1 - t0)
    const u = hash01(i, salt)
    const side = i % 2 === 0 ? -1 : 1
    const lateral = side * (spec.sideMin + u * (spec.sideMax - spec.sideMin))
    const point = curve.getPointAt(Math.min(Math.max(t, 0), 1))
    const tangent = curve.getTangentAt(Math.min(Math.max(t, 0), 1)).normalize()
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize()
    if (right.lengthSq() < 0.001) right.set(1, 0, 0)
    const pos = point.clone().addScaledVector(right, lateral)
    const yaw = hash01(i, salt + 3) * Math.PI * 2
    const scale = 1 + (hash01(i, salt + 9) - 0.5) * (spec.scaleJitter ?? 0)
    items.push({
      position: [pos.x, spec.y ?? 0, pos.z],
      rotation: [0, yaw, 0],
      scale,
    })
  }

  return items
}

export function getStandingTrees(level: number) {
  return scatterAlongPath({
    curve: getLevelPath(level),
    spec: { count: 24, sideMin: 8, sideMax: 21, scaleJitter: 0.5 },
    salt: level,
  })
}

export function fellTrees(level: number, fallen: number[], x: number, z: number) {
  const trees = getStandingTrees(level)
  for (const [i, tree] of trees.entries()) {
    if (Math.hypot(tree.position[0] - x, tree.position[2] - z) <= EXPLOSION_RADIUS && !fallen.includes(i))
      fallen.push(i)
  }
}
