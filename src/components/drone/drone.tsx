import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group } from 'three'
import { StaticModel } from '@/components/models/static-model'
import { DRONE_MODEL } from '@/constants/models'
import { useGameStore } from '@/stores/use-game-store'

function PlaceholderDrone() {
  return (
    <group rotation={DRONE_MODEL.rotation ?? [0, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.35, 0.1, 0.35]} />
        <meshStandardMaterial color="#3a4a5a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function Drone() {
  const bodyRef = useRef<Group>(null)
  const orientationRef = useRef<Group>(null)
  const hasDrone = useGameStore((s) => s.drone !== null)

  const visualYaw = useRef(0)

  useFrame((state, delta) => {
    const drone = useGameStore.getState().drone
    if (!drone || !bodyRef.current || !orientationRef.current) return

    bodyRef.current.position.set(drone.position.x, drone.position.y - 0.1, drone.position.z)
    
    // Smoothly interpolate the visual rotation toward the target physics rotation (-drone.yaw)
    // Adjust the 0.1 factor (closer to 1 = faster snap, closer to 0 = smoother/slower)
    visualYaw.current = THREE.MathUtils.lerp(visualYaw.current, -drone.yaw, 0.15)
    
    orientationRef.current.rotation.set(0, visualYaw.current, 0)
  })

  if (!hasDrone) return null

  return (
    <group ref={bodyRef}>
      <group ref={orientationRef}>
        <StaticModel
          path={DRONE_MODEL.path}
          targetSize={DRONE_MODEL.targetSize}
          rotation={DRONE_MODEL.rotation}
          scale={DRONE_MODEL.scale}
          fallback={<PlaceholderDrone />}
        />
      </group>
    </group>
  )
}
