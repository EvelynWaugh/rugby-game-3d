import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { StaticModel } from '@/components/models/static-model'
import { HAZARD_MODELS } from '@/constants/models'
import { useGameStore } from '@/stores/use-game-store'

const wrap = THREE.MathUtils.euclideanModulo

export function WindStreaks() {
  const group = useRef<THREE.LineSegments>(null)
  const offset = useRef({ x: 0, z: 0 })
  const positions = useMemo(() => new Float32Array(40 * 6), [])
  useFrame((_, delta) => {
    const { wind, drone } = useGameStore.getState()
    if (!drone || !group.current) return
    offset.current.x += wind.x * delta * 7
    offset.current.z += wind.z * delta * 7
    for (let i = 0; i < 40; i++) {
      const x = drone.position.x + wrap(i * 13.13 + offset.current.x - drone.position.x, 36) - 18
      const y = 1 + wrap(i * 7.73, 28)
      const z = drone.position.z + wrap(i * 23.7 + offset.current.z - drone.position.z, 36) - 18
      const k = i * 6
      positions[k] = x
      positions[k + 1] = y
      positions[k + 2] = z
      positions[k + 3] = x + wind.x * 1.2
      positions[k + 4] = y + 0.06
      positions[k + 5] = z + wind.z * 1.2
    }
    group.current.geometry.attributes.position.needsUpdate = true
  })
  return (
    <lineSegments ref={group} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#e9ead4" transparent opacity={0.48} depthWrite={false} />
    </lineSegments>
  )
}

export function SectorHazards() {
  const towers = useGameStore(s => s.ewTowers)
  const drones = useGameStore(s => s.enemyDrones)
  const nets = useGameStore(s => s.cargoNets)
  const player = useGameStore(s => s.drone)
  return (
    <group>
      {towers.filter(t => !t.dead).map(t => (
        <StaticModel key={t.id} {...HAZARD_MODELS.jammer} ground position={[t.position.x, 0, t.position.z]} />
      ))}
      {drones.filter(d => !d.dead).map(d => (
        <group key={d.id} position={[d.position.x, d.position.y, d.position.z]} rotation={[0, Math.atan2(d.velocity.x, d.velocity.z), 0]}>
          <StaticModel {...HAZARD_MODELS.drone} />
          {d.cool < 100 && <StaticModel {...HAZARD_MODELS.net} position={[0, -0.55, 0]} scale={0.55} />}
        </group>
      ))}
      {nets.map(n => <StaticModel key={n.id} {...HAZARD_MODELS.net} position={[n.position.x, n.position.y, n.position.z]} />)}
      {player && player.netTicks > 0 && <StaticModel {...HAZARD_MODELS.net} scale={0.5}
        position={[player.position.x, player.position.y, player.position.z]} />}
    </group>
  )
}

export function BlastMarks() {
  const marks = useGameStore(s => s.blastMarks)
  const frame = useGameStore(s => s.frame)
  return marks.map(mark => {
    const age = frame - mark.frame
    return (
      <group key={mark.id} position={[mark.x, 0.045, mark.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh scale={2.7}>
          <circleGeometry args={[1, 24]} />
          <meshBasicMaterial color="#382f27" transparent opacity={0.48 * (1 - age / 600)} depthWrite={false} />
        </mesh>
        {age < 24 && <mesh scale={0.6 + Math.sqrt(age / 24) * 7.4} position={[0, 0, 0.035]}>
          <ringGeometry args={[0.88, 1, 48]} />
          <meshBasicMaterial color="#ffe2a4" transparent opacity={1 - age / 24} depthWrite={false} />
        </mesh>}
      </group>
    )
  })
}
