import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { RatAnimatedModel } from '@/components/models/rat-animated-model'
import { StaticModel } from '@/components/models/static-model'
import { ENV_MODELS, SHELTER_MODEL, SHELTER_WORLD } from '@/constants/models'
import type { Rat, Shelter } from '@/types/game'

function PlaceholderShelter({ dead, command }: { dead: boolean; command: boolean }) {
  return (
    <mesh castShadow receiveShadow position={[0, SHELTER_WORLD.h / 2, 0]}>
      <boxGeometry args={[SHELTER_WORLD.w, SHELTER_WORLD.h, SHELTER_WORLD.d]} />
      <meshStandardMaterial
        color={dead ? '#181c22' : command ? '#4a1f1f' : '#2a3340'}
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

export function ShelterMesh({ shelter }: { shelter: Shelter }) {
  const groupRef = useRef<Group>(null)
  const hpRatio = shelter.hp / shelter.maxhp

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(shelter.position.x, shelter.position.y, shelter.position.z)
    groupRef.current.rotation.set(
      shelter.dead ? 0.12 : 0,
      shelter.yaw,
      shelter.dead ? 0.06 : 0,
    )
  })

  return (
    <group ref={groupRef}>
      <StaticModel
        path={SHELTER_MODEL.path}
        targetSize={SHELTER_MODEL.targetSize}
        ground
        tint={shelter.command ? '#cc3333' : undefined}
        fallback={<PlaceholderShelter dead={shelter.dead} command={shelter.command} />}
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
