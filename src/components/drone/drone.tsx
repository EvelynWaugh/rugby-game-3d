import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { StaticModel } from '@/components/models/static-model'
import { DRONE_MODEL } from '@/constants/models'
import { getActiveCurve } from '@/systems/setup-level'
import { getDroneRotation } from '@/systems/update-drone'
import { useGameStore } from '@/stores/use-game-store'

function PlaceholderDrone() {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color="#3a4a5a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.35]} castShadow>
        <coneGeometry args={[0.08, 0.25, 4]} />
        <meshStandardMaterial color="#00b4ff" emissive="#004466" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

export function Drone() {
  const groupRef = useRef<Group>(null)
  const level = useGameStore((s) => s.level)
  const drone = useGameStore((s) => s.drone)

  useFrame(() => {
    if (!groupRef.current || !drone) return
    const curve = getActiveCurve(level)
    const rot = getDroneRotation(curve, drone)
    groupRef.current.position.set(drone.position.x, drone.position.y, drone.position.z)
    groupRef.current.rotation.set(rot.x, rot.y, rot.z)
  })

  if (!drone) return null

  return (
    <group ref={groupRef}>
      <StaticModel
        path={DRONE_MODEL.path}
        targetSize={DRONE_MODEL.targetSize}
        rotation={DRONE_MODEL.rotation}
        scale={DRONE_MODEL.scale}
        fallback={<PlaceholderDrone />}
      />
    </group>
  )
}
