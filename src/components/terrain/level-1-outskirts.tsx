import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { StaticModel } from '@/components/models/static-model'
import { ENV_MODELS } from '@/constants/models'
import { getStandingTrees, scatterAlongPath } from '@/systems/terrain-layout'
import { useGameStore } from '@/stores/use-game-store'
import { makeSurfaceTexture } from './surface-texture'
import { Ground } from './ground'
import { getLevelPath } from '@/systems/path-system'

for (const model of Object.values(ENV_MODELS)) {
  useGLTF.preload(model.path)
}

const fallenVariants = [ENV_MODELS.fallenTree, ENV_MODELS.fallenTree2, ENV_MODELS.fallenTree3]

export function LevelTerrain({ level }: { level: number }) {
  const fallen = useGameStore(s => s.fallenTrees)
  const curve = useMemo(() => getLevelPath(level), [level])

  const roadTexture = useMemo(() => makeSurfaceTexture(true, level >= 3), [level])
  useEffect(() => () => roadTexture.dispose(), [roadTexture])
  const roadGeometry = useMemo(() => {
    const segments = 200
    const width = 8
    const vertices: number[] = []
    const indices: number[] = []
    const uvs: number[] = []
    const repeats = curve.getLength() / 8

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const point = curve.getPointAt(t)
      const tangent = curve.getTangentAt(t).normalize()
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize()

      const left = point.clone().addScaledVector(right, -width / 2)
      const rightPt = point.clone().addScaledVector(right, width / 2)

      uvs.push(0, t * repeats, 1, t * repeats)
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
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [curve])

  const greenTrees = useMemo(() => getStandingTrees(level), [level])
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
      <Ground level={level} />

      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial map={roadTexture} roughness={1} />
      </mesh>

      {terrainPatches.map((p, i) => (
        <group key={`terrain-${i}`} position={[p.position[0], -0.4, p.position[2]]}
          rotation={p.rotation} scale={[p.scale, 0.15, p.scale]}>
          <StaticModel {...ENV_MODELS.terrain} ground />
        </group>
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
      {greenTrees.map((p, i) => {
        const model = fallen.includes(i) ? fallenVariants[i % fallenVariants.length] : ENV_MODELS.greenTree
        return (
          <StaticModel
            key={`tree-${i}`}
            {...model}
            position={p.position}
            rotation={p.rotation}
            scale={p.scale}
            ground
          />
        )
      })}
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


    </group>
  )
}
