import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { StaticModel } from '@/components/models/static-model'
import { ENV_MODELS } from '@/constants/models'
import { getLevelPath } from '@/systems/path-system'

for (const model of Object.values(ENV_MODELS)) {
  useGLTF.preload(model.path)
}

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

function scatterAlongPath({
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

export function Level1Outskirts() {
  const curve = useMemo(() => getLevelPath(1), [])

  const roadGeometry = useMemo(() => {
    const segments = 200
    const width = 8
    const vertices: number[] = []
    const indices: number[] = []

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const point = curve.getPointAt(t)
      const tangent = curve.getTangentAt(t).normalize()
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize()

      const left = point.clone().addScaledVector(right, -width / 2)
      const rightPt = point.clone().addScaledVector(right, width / 2)

      vertices.push(left.x, 0.02, left.z)
      vertices.push(rightPt.x, 0.02, rightPt.z)

      if (i < segments) {
        const base = i * 2
        indices.push(base, base + 1, base + 2)
        indices.push(base + 1, base + 3, base + 2)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [curve])

  const greenTrees = useMemo(
    () => scatterAlongPath({ curve, spec: { count: 16, sideMin: 11, sideMax: 20, scaleJitter: 0.45 }, salt: 1 }),
    [curve],
  )
  const fallenTrees = useMemo(
    () => scatterAlongPath({ curve, spec: { count: 5, sideMin: 8, sideMax: 14, scaleJitter: 0.25, t0: 0.12, t1: 0.9 }, salt: 2 }),
    [curve],
  )
  const fallenTrees2 = useMemo(
    () => scatterAlongPath({ curve, spec: { count: 4, sideMin: 9, sideMax: 16, scaleJitter: 0.2, t0: 0.18, t1: 0.92 }, salt: 3 }),
    [curve],
  )
  const snags = useMemo(
    () => scatterAlongPath({ curve, spec: { count: 4, sideMin: 10, sideMax: 18, scaleJitter: 0.3, t0: 0.2, t1: 0.88 }, salt: 4 }),
    [curve],
  )
  const rocks = useMemo(
    () => scatterAlongPath({ curve, spec: { count: 10, sideMin: 6.5, sideMax: 13, scaleJitter: 0.4 }, salt: 5 }),
    [curve],
  )
  const dirtMounds = useMemo(
    () => scatterAlongPath({ curve, spec: { count: 8, sideMin: 5, sideMax: 11, scaleJitter: 0.35, y: -0.08 }, salt: 6 }),
    [curve],
  )
  const crates = useMemo(
    () => scatterAlongPath({ curve, spec: { count: 6, sideMin: 7, sideMax: 12, scaleJitter: 0.15, t0: 0.22, t1: 0.8 }, salt: 7 }),
    [curve],
  )
  const walls = useMemo(
    () => scatterAlongPath({ curve, spec: { count: 4, sideMin: 12, sideMax: 18, scaleJitter: 0.12, t0: 0.25, t1: 0.75 }, salt: 8 }),
    [curve],
  )
  const terrainPatches = useMemo(
    () => scatterAlongPath({ curve, spec: { count: 7, sideMin: 10, sideMax: 22, scaleJitter: 0.25, y: -0.12 }, salt: 9 }),
    [curve],
  )

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -240]} receiveShadow>
        <planeGeometry args={[200, 600]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>

      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>

      {terrainPatches.map((p, i) => (
        <StaticModel
          key={`terrain-${i}`}
          path={ENV_MODELS.terrain.path}
          targetSize={ENV_MODELS.terrain.targetSize}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
          ground
        />
      ))}
      {dirtMounds.map((p, i) => (
        <StaticModel
          key={`dirt-${i}`}
          path={ENV_MODELS.dirt.path}
          targetSize={ENV_MODELS.dirt.targetSize}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
          ground
        />
      ))}
      {greenTrees.map((p, i) => (
        <StaticModel
          key={`tree-${i}`}
          path={ENV_MODELS.greenTree.path}
          targetSize={ENV_MODELS.greenTree.targetSize}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
          ground
        />
      ))}
      {fallenTrees.map((p, i) => (
        <StaticModel
          key={`fall-${i}`}
          path={ENV_MODELS.fallenTree.path}
          targetSize={ENV_MODELS.fallenTree.targetSize}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
          ground
        />
      ))}
      {fallenTrees2.map((p, i) => (
        <StaticModel
          key={`fall2-${i}`}
          path={ENV_MODELS.fallenTree2.path}
          targetSize={ENV_MODELS.fallenTree2.targetSize}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
          ground
        />
      ))}
      {snags.map((p, i) => (
        <StaticModel
          key={`snag-${i}`}
          path={ENV_MODELS.fallenTree3.path}
          targetSize={ENV_MODELS.fallenTree3.targetSize}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
          ground
        />
      ))}
      {rocks.map((p, i) => (
        <StaticModel
          key={`rock-${i}`}
          path={ENV_MODELS.granit.path}
          targetSize={ENV_MODELS.granit.targetSize}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
          ground
        />
      ))}
      {crates.map((p, i) => (
        <StaticModel
          key={`crate-${i}`}
          path={ENV_MODELS.crate.path}
          targetSize={ENV_MODELS.crate.targetSize}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
          ground
        />
      ))}
      {walls.map((p, i) => (
        <StaticModel
          key={`wall-${i}`}
          path={ENV_MODELS.wall.path}
          targetSize={ENV_MODELS.wall.targetSize}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
          ground
        />
      ))}

      <mesh position={[0, -0.5, -250]} receiveShadow>
        <boxGeometry args={[300, 1, 600]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
    </group>
  )
}
