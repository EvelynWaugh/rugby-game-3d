import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshBasicMaterial } from 'three'
import type { Particle, PigPart, Smoke } from '@/types/game'

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

export function SmokeClouds({ smoke }: { smoke: Smoke[] }) {
  return (
    <group>
      {smoke.map((s) => (
        <SmokeMesh key={s.id} smoke={s} />
      ))}
    </group>
  )
}

function SmokeMesh({ smoke }: { smoke: Smoke }) {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.position.set(smoke.position.x, smoke.position.y, smoke.position.z)
    meshRef.current.scale.setScalar(smoke.r)
    const mat = meshRef.current.material as MeshBasicMaterial
    if (mat) mat.opacity = (smoke.life / smoke.max) * 0.4
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#888888" transparent opacity={0.3} />
    </mesh>
  )
}

export function PigSplatParts({ parts }: { parts: PigPart[] }) {
  return (
    <group>
      {parts.map((pp) => (
        <mesh
          key={pp.id}
          position={[pp.position.x, pp.position.y, pp.position.z]}
          rotation={[pp.rot, pp.rot, 0]}
        >
          <sphereGeometry args={[pp.type === 'head' ? 0.35 : 0.5, 8, 8]} />
          <meshStandardMaterial color="#FF69B4" />
        </mesh>
      ))}
    </group>
  )
}
