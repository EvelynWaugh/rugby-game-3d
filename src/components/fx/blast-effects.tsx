import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, Color, InstancedMesh, Object3D, Texture, Vector3 } from 'three'
import { useGameStore } from '@/stores/use-game-store'
import { makeBlastTexture } from './blast-textures'

const up = new Vector3(0, 1, 0)
const turn = Math.PI * (3 - Math.sqrt(5))

function Fragments({ age, phase }: { age: number; phase: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const direction = useMemo(() => new Vector3(), [])
  const color = useMemo(() => new Color(), [])
  useLayoutEffect(() => {
    if (!mesh.current) return
    for (let i = 0; i < mesh.current.count; i++) {
      const angle = i * turn + phase
      const speed = 0.12 + ((i * 7) % 19) * 0.018
      const lift = 0.12 + ((i * 11) % 17) * 0.018
      const dx = Math.cos(angle) * speed
      const dz = Math.sin(angle) * speed
      const travel = 25 * (1 - Math.exp(-age / 25))
      const height = 0.3 + lift * age - 0.006 * age * age
      dummy.position.set(dx * travel, Math.max(0.05, height), dz * travel)
      direction.set(dx * Math.exp(-age / 25), lift - 0.012 * age, dz * Math.exp(-age / 25)).normalize()
      dummy.quaternion.setFromUnitVectors(up, direction)
      const rock = i % 4 === 0
      const fade = Math.max(0, 1 - age / (rock ? 64 : 38))
      const width = rock ? 0.14 : 0.042
      dummy.scale.set(width, rock ? 0.23 : 0.58, width).multiplyScalar(height > 0 ? fade : 0)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      color.set(rock ? '#493a2b' : i % 3 === 0 ? '#fff9c9' : '#ffac39')
      mesh.current.setColorAt(i, color)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [age, phase, color, direction, dummy])
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 38]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

function Plume({ age, phase, fire, cloud }: { age: number; phase: number; fire: Texture; cloud: Texture }) {
  const t = age / 60
  return Array.from({ length: 9 }, (_, i) => {
    const angle = phase + i * turn
    const expansion = 1 - Math.exp(-7 * t)
    const spread = i === 0 ? 0 : (1 + i % 3 * 0.42) * expansion
    const x = Math.cos(angle) * spread
    const z = Math.sin(angle) * spread
    const size = 0.85 + 2.8 * expansion + t * 1.05
    const y = 0.55 + expansion * (i % 3) * 0.5 + t * (1.2 + i % 4 * 0.42)
    const heat = Math.max(0, 1 - age / (32 + i % 4 * 6))
    return (
      <group key={i}>
        <sprite position={[x + t * 0.32, y, z]} scale={[size * 1.4, size * 1.2, 1]}>
          <spriteMaterial map={cloud} color={i % 3 ? '#60564c' : '#938471'} rotation={angle + t * 0.18}
            transparent depthWrite={false} opacity={Math.min(0.88, age / 10) * Math.max(0, 1 - age / 112)} />
        </sprite>
        {heat > 0 && <sprite position={[x, y + 0.12, z]} renderOrder={2} scale={[size * 1.45, size * 1.5, 1]}>
          <spriteMaterial map={fire} rotation={angle - t * 0.35} transparent depthWrite={false}
            opacity={Math.sqrt(heat)} toneMapped={false} />
        </sprite>}
      </group>
    )
  })
}

export function BlastEffects() {
  const marks = useGameStore(s => s.blastMarks)
  const frame = useGameStore(s => s.frame)
  const fire = useMemo(() => makeBlastTexture(true), [])
  const cloud = useMemo(() => makeBlastTexture(false), [])
  useEffect(() => () => {
    fire.dispose()
    cloud.dispose()
  }, [fire, cloud])
  return marks.map(mark => {
    const age = frame - mark.frame
    const phase = mark.frame * turn
    const scale = mark.kind === 'ram' ? 0.62 : mark.kind === 'crash' ? 0.88 : 1
    return (
      <group key={mark.id} position={[mark.x, 0.05, mark.z]} scale={scale}>
        <mesh rotation={[-Math.PI / 2, 0, phase]} scale={[8.5, 7.5, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={cloud} color="#241d15" transparent opacity={0.85 * (1 - age / 600)} depthWrite={false} />
        </mesh>
        {age < 24 && <mesh rotation={[-Math.PI / 2, 0, phase]} position={[0, 0.06, 0]} scale={0.6 + Math.sqrt(age / 24) * 7.4}>
          <ringGeometry args={[0.91, 1, 64]} />
          <meshBasicMaterial color="#ffcd85" blending={AdditiveBlending} transparent opacity={0.8 * (1 - age / 24)} depthWrite={false} />
        </mesh>}
        {age < 10 && <sprite renderOrder={3} position={[0, 0.9, 0]} scale={[5.5, 3.8, 1]}>
          <spriteMaterial map={cloud} color="#fff5ba" blending={AdditiveBlending} toneMapped={false}
            transparent opacity={1 - age / 10} depthWrite={false} />
        </sprite>}
        {age < 112 && <Plume age={age} phase={phase} fire={fire} cloud={cloud} />}
        {age < 64 && <Fragments age={age} phase={phase} />}
      </group>
    )
  })
}
