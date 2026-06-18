import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { Shelter } from '@/types/game'
import { useGameStore } from '@/stores/use-game-store'

function Rat({ x, z, dead, frame, phase }: { x: number; z: number; dead: boolean; frame: number; phase: number }) {
  if (dead) return null
  const twitch = Math.sin(frame * 0.35 + phase) * 0.06
  return (
    <mesh position={[x + twitch, 0.3, z]} castShadow>
      <sphereGeometry args={[0.15, 6, 6]} />
      <meshStandardMaterial color="#6a6a6a" />
    </mesh>
  )
}

export function ShelterMesh({ shelter }: { shelter: Shelter }) {
  const groupRef = useRef<Group>(null)
  const frame = useGameStore((s) => s.frame)

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(shelter.position.x, shelter.position.y, shelter.position.z)
  })

  const w = shelter.w
  const h = shelter.h
  const hpRatio = shelter.hp / shelter.maxhp

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, w * 0.8]} />
        <meshStandardMaterial
          color={shelter.dead ? '#181c22' : shelter.command ? '#4a1f1f' : '#2a3340'}
        />
      </mesh>
      {!shelter.dead && (
        <mesh position={[0, h / 2 + 0.3, 0]}>
          <boxGeometry args={[w * 0.6, 0.15, 0.1]} />
          <meshStandardMaterial color={shelter.command ? '#ff5a5a' : '#ffcf6b'} emissive={shelter.command ? '#551111' : '#332200'} emissiveIntensity={0.3} />
        </mesh>
      )}
      {shelter.rats.map((rat, i) => (
        <Rat
          key={i}
          x={rat.ox}
          z={rat.oy}
          dead={rat.dead || shelter.dead}
          frame={frame}
          phase={rat.phase}
        />
      ))}
      {!shelter.dead && (
        <mesh position={[0, h / 2 + 0.6, w * 0.45]}>
          <boxGeometry args={[w * hpRatio, 0.12, 0.05]} />
          <meshStandardMaterial color={shelter.command ? '#ff5a5a' : '#ffcf6b'} />
        </mesh>
      )}
    </group>
  )
}
