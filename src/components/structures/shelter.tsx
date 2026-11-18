import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { RatAnimatedModel } from '@/components/models/rat-animated-model'
import { StaticModel } from '@/components/models/static-model'
import { ENV_MODELS, SHELTER_MODEL, SHELTER_WORLD } from '@/constants/models'
import type { Rat, Shelter } from '@/types/game'

function PlaceholderShelter({ command }: { command: boolean }) {
  return (
    <mesh castShadow receiveShadow position={[0, SHELTER_WORLD.h / 2, 0]}>
      <boxGeometry args={[SHELTER_WORLD.w, SHELTER_WORLD.h, SHELTER_WORLD.d]} />
      <meshStandardMaterial
        color={command ? '#4a1f1f' : '#2a3340'}
      />
    </mesh>
  )
}

function PlaceholderRat() {
  return (
    <mesh castShadow position={[0, 0.12, 0]}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial color="#6a6a6a" />
    </mesh>
  )
}

function ShelterRat({ rat, shelterDead }: { rat: Rat; shelterDead: boolean }) {
  const groupRef = useRef<Group>(null)
  const facingRef = useRef(Math.atan2(rat.vx, rat.vz))
  const isDead = rat.dead || shelterDead

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(rat.ox, 0, rat.oz)

    if (isDead) {
      groupRef.current.rotation.y = facingRef.current
      return
    }

    if (Math.hypot(rat.vx, rat.vz) > 0.0002)
      facingRef.current = Math.atan2(rat.vx, rat.vz)

    groupRef.current.rotation.y = facingRef.current
  })

  return (
    <group ref={groupRef} position={[rat.ox, 0, rat.oz]}>
      <RatAnimatedModel
        animKey={isDead ? 'die' : 'walk'}
        fallback={<PlaceholderRat />}
      />
    </group>
  )
}

function ShelterRuin() {
  const { w, d } = SHELTER_WORLD
  return (
    <group name="shelter-ruins">
      <StaticModel {...ENV_MODELS.wall} targetSize={w * 0.68} position={[-w * 0.18, -0.32, -d * 0.3]}
        rotation={[0.16, -0.12, -0.09]} ground />
      <StaticModel {...ENV_MODELS.wall} targetSize={d * 0.48} position={[w * 0.28, -0.42, d * 0.1]}
        rotation={[-0.34, 1.34, 0.2]} ground />
      <group position={[-0.4, -0.15, 0.2]} scale={[1, 0.22, 0.9]}>
        <StaticModel {...ENV_MODELS.dirt} targetSize={w * 0.7} ground />
      </group>
      {Array.from({ length: 10 }, (_, i) => {
        const angle = i * 2.4
        const radius = 1.2 + (i % 3) * 1.05
        return (
          <mesh key={i} castShadow receiveShadow
            position={[Math.cos(angle) * radius, 0.18 + i % 2 * 0.12, Math.sin(angle) * radius]}
            rotation={[i * 0.21, angle, i * 0.09]}>
            <boxGeometry args={[0.9 + (i % 3) * 0.48, 0.36, 0.55 + i % 2 * 0.46]} />
            <meshStandardMaterial color={i % 2 ? '#65594c' : '#49453e'} roughness={1} />
          </mesh>
        )
      })}
    </group>
  )
}

function IntactShelter({ command }: { command: boolean }) {
  return (
    <group>
      <StaticModel
        path={SHELTER_MODEL.path}
        targetSize={SHELTER_MODEL.targetSize}
        ground
        tint={command ? '#cc3333' : undefined}
        fallback={<PlaceholderShelter command={command} />}
      />
      <StaticModel
        path={ENV_MODELS.crate.path}
        targetSize={ENV_MODELS.crate.targetSize}
        position={[SHELTER_WORLD.w * 0.58, 0, SHELTER_WORLD.d * 0.22]}
        rotation={[0, 0.4, 0]}
        ground
      />
      <StaticModel
        path={ENV_MODELS.crate.path}
        targetSize={ENV_MODELS.crate.targetSize * 0.9}
        position={[SHELTER_WORLD.w * 0.58, 0, SHELTER_WORLD.d * 0.22 - 1.2]}
        rotation={[0, -0.2, 0]}
        ground
      />
    </group>
  )
}

export function ShelterMesh({ shelter }: { shelter: Shelter }) {
  const hpRatio = shelter.hp / shelter.maxhp
  return (
    <group position={[shelter.position.x, shelter.position.y, shelter.position.z]} rotation={[0, shelter.yaw, 0]}>
      {shelter.dead ? <ShelterRuin /> : <IntactShelter command={shelter.command} />}
      {shelter.rats.map((rat, i) => (
        <ShelterRat key={i} rat={rat} shelterDead={shelter.dead} />
      ))}
      {!shelter.dead && (
        <mesh position={[0, SHELTER_WORLD.h + 0.45, 0]}>
          <boxGeometry args={[Math.max(SHELTER_WORLD.w * hpRatio, 0.05), 0.12, 0.08]} />
          <meshStandardMaterial
            color={shelter.command ? '#ff5a5a' : '#ffcf6b'}
            emissive={shelter.command ? '#551111' : '#332200'}
            emissiveIntensity={0.35}
          />
        </mesh>
      )}
    </group>
  )
}
