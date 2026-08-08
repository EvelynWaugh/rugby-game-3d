import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { StaticModel } from '@/components/models/static-model'
import { DRONE_MODEL } from '@/constants/models'
import { DRONE_MAX_SPEED } from '@/constants/game'
import { droneForwardVector, getDroneAttitude } from '@/systems/update-drone'
import { useGameStore } from '@/stores/use-game-store'

function PlaceholderDrone() {
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.35, 0.1, 0.35]} />
        <meshStandardMaterial color="#3a4a5a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function Drone() {
  const bodyRef = useRef<Group>(null)
  const yawRef = useRef<Group>(null)
  const pitchRef = useRef<Group>(null)
  const rollRef = useRef<Group>(null)
  const hasDrone = useGameStore((s) => s.drone !== null)

  useFrame(() => {
    const drone = useGameStore.getState().drone
    if (!drone || !bodyRef.current || !yawRef.current || !pitchRef.current || !rollRef.current) return

    const fwd = droneForwardVector(drone.yaw)
    const horizSpeed = Math.hypot(drone.velocity.x, drone.velocity.z)
    const speedT = Math.min(horizSpeed / DRONE_MAX_SPEED, 1)
    const forwardNudge = 0.12 + speedT * 0.28
    const { pitch, bank } = getDroneAttitude(drone)

    bodyRef.current.position.set(
      drone.position.x + fwd.x * forwardNudge,
      drone.position.y - 0.1,
      drone.position.z + fwd.z * forwardNudge,
    )

    yawRef.current.rotation.set(0, drone.yaw, 0)
    pitchRef.current.rotation.set(pitch, 0, 0)
    rollRef.current.rotation.set(0, 0, bank)
  })

  if (!hasDrone) return null

  return (
    <group ref={bodyRef}>
      <group ref={yawRef}>
        <group ref={pitchRef}>
          <group ref={rollRef}>
            <StaticModel
              path={DRONE_MODEL.path}
              targetSize={DRONE_MODEL.targetSize}
              rotation={DRONE_MODEL.rotation}
              scale={DRONE_MODEL.scale}
              fallback={<PlaceholderDrone />}
            />
          </group>
        </group>
      </group>
    </group>
  )
}
