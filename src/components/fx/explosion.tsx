import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshBasicMaterial } from 'three'
import type { Particle } from '@/types/game'

export function Particles({ particles }: { particles: Particle[] }) {
  return (
    <group>
      {particles.map((p) => (
        <ParticleMesh key={p.id} particle={p} />
      ))}
    </group>
  )
}

function ParticleMesh({ particle }: { particle: Particle }) {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.position.set(particle.position.x, particle.position.y, particle.position.z)
    const opacity = particle.life / particle.max
    const mat = meshRef.current.material as MeshBasicMaterial
    if (mat) mat.opacity = opacity
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[particle.r, 6, 6]} />
      <meshBasicMaterial color={particle.color} transparent opacity={particle.life / particle.max} />
    </mesh>
  )
}
