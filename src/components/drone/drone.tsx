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
    <group scale={0.4}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color="#3a4a5a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function Drone() {
  const groupRef = useRef<Group>(null)
  const level = useGameStore((s) => s.level)
  const hasDrone = useGameStore((s) => s.drone !== null)

  useFrame(() => {
    const drone = useGameStore.getState().drone
    if (!drone || !groupRef.current) return

    groupRef.current.position.set(drone.position.x, drone.position.y, drone.position.z)
    const rot = getDroneRotation(getActiveCurve(level), drone)
    groupRef.current.rotation.set(rot.x, rot.y, rot.z)
  })

  if (!hasDrone) return null

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
