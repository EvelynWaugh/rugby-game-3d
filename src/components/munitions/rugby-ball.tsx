import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { Munition } from '@/types/game'

export function RugbyBall({ munition }: { munition: Munition }) {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (!meshRef.current || munition.done) return
    meshRef.current.position.set(munition.position.x, munition.position.y, munition.position.z)
    meshRef.current.rotation.set(munition.rot, munition.rot * 0.7, munition.rot * 0.3)
    const scale = munition.isBigBall ? 1.6 : 1
    meshRef.current.scale.setScalar(scale)
  })

  if (munition.done) return null

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.35, 12, 8]} />
      <meshStandardMaterial color="#c45c26" roughness={0.6} metalness={0.1} />
    </mesh>
  )
}
