import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { PIG_MODEL_CONFIG, PIG_MODEL_PATH } from '@/constants/game'
import { GltfModel } from '@/components/models/gltf-model'
import type { Soldier } from '@/types/game'
import { dist3 } from '@/utils/math'
import { useGameStore } from '@/stores/use-game-store'

interface PigUnitProps {
  soldier: Soldier
  tint?: string
}

function PlaceholderPig({ tint = '#f4a6b8' }: { tint?: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.5, 0.8, 4, 8]} />
        <meshStandardMaterial color={tint} />
      </mesh>
      <mesh castShadow position={[0, 1.6, 0.3]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color={tint} />
      </mesh>
    </group>
  )
}

export function PigUnit({ soldier, tint }: PigUnitProps) {
  const groupRef = useRef<Group>(null)
  const drone = useGameStore((s) => s.drone)

  useFrame(() => {
    if (!groupRef.current || soldier.dead) return
    groupRef.current.position.set(soldier.position.x, soldier.position.y, soldier.position.z)

    if (drone) {
      const dx = drone.position.x - soldier.position.x
      const dz = drone.position.z - soldier.position.z
      groupRef.current.rotation.y = Math.atan2(dx, dz)
    }

    if (soldier.behavior === 'flee') {
      groupRef.current.rotation.x = 0.3
      groupRef.current.scale.setScalar(0.95)
    } else {
      groupRef.current.rotation.x = -0.2
      groupRef.current.scale.setScalar(1)
    }
  })

  if (soldier.dead || soldier.visible === false) return null

  return (
    <group ref={groupRef}>
      <GltfModel
        path={PIG_MODEL_PATH}
        scale={PIG_MODEL_CONFIG.scale}
        rotationY={PIG_MODEL_CONFIG.rotationY}
        offsetY={PIG_MODEL_CONFIG.offsetY}
        targetSize={PIG_MODEL_CONFIG.targetSize}
        fallback={<PlaceholderPig tint={tint} />}
      />
    </group>
  )
}

export function PigSoldier({ soldier }: { soldier: Soldier }) {
  return <PigUnit soldier={soldier} tint="#f4a6b8" />
}

export function RedSoldier({ soldier }: { soldier: Soldier }) {
  return <PigUnit soldier={soldier} tint="#cc3333" />
}

export function useSoldierDistance(soldier: Soldier) {
  const drone = useGameStore((s) => s.drone)
  if (!drone) return Infinity
  return dist3(drone.position, soldier.position)
}
