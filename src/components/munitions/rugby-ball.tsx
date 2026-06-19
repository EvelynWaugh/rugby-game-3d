import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { BallVisual } from '@/components/munitions/ball-model-cache'
import { BALL_MODEL } from '@/constants/models'
import type { Munition } from '@/types/game'

export function RugbyBall({ munition }: { munition: Munition }) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (!groupRef.current || munition.done) return
    groupRef.current.position.set(munition.position.x, munition.position.y, munition.position.z)
    groupRef.current.rotation.set(munition.rot * 0.4, munition.rot, munition.rot * 0.2)
    const s = (munition.isBigBall ? 1.3 : 1) * BALL_MODEL.targetSize
    groupRef.current.scale.setScalar(s)
  })

  if (munition.done) return null

  return (
    <group ref={groupRef}>
      <BallVisual />
    </group>
  )
}
