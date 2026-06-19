import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { StaticModel } from '@/components/models/static-model'
import { BALL_MODEL } from '@/constants/models'
import type { Munition } from '@/types/game'

function PlaceholderBall() {
  return (
    <mesh castShadow>
      <sphereGeometry args={[0.2, 12, 8]} />
      <meshStandardMaterial color="#c45c26" roughness={0.6} />
    </mesh>
  )
}

export function RugbyBall({ munition }: { munition: Munition }) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (!groupRef.current || munition.done) return
    groupRef.current.position.set(munition.position.x, munition.position.y, munition.position.z)
    groupRef.current.rotation.set(munition.rot, munition.rot * 0.7, munition.rot * 0.3)
    const s = munition.isBigBall ? 1.4 : 1
    groupRef.current.scale.setScalar(s)
  })

  if (munition.done) return null

  return (
    <group ref={groupRef}>
      <StaticModel
        path={BALL_MODEL.path}
        targetSize={BALL_MODEL.targetSize}
        fallback={<PlaceholderBall />}
      />
    </group>
  )
}
