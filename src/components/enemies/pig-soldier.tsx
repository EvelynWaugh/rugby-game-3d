import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { AnimatedModel } from '@/components/models/animated-model'
import { WeaponAk } from '@/components/models/weapon-ak'
import { PIG_ANIMS, type PigAnimKey } from '@/constants/models'
import type { Soldier } from '@/types/game'
import { useGameStore } from '@/stores/use-game-store'

interface PigUnitProps {
  soldier: Soldier
  tint?: string
}

function pickAnimKey(soldier: Soldier): PigAnimKey {
  if (soldier.dead) {
    return soldier.deathVariant === 'shot' ? 'deathShot' : 'deathAbdominal'
  }
  if (soldier.behavior === 'flee') return 'run'
  if (soldier.behavior === 'aim') return 'aim'
  return 'walkGun'
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

  const animKey = pickAnimKey(soldier)
  const anim = PIG_ANIMS[animKey]
  const isDead = soldier.dead

  useFrame(() => {
    if (!groupRef.current) return
    if (soldier.dead && soldier.deathTimer <= 0) return

    groupRef.current.position.set(soldier.position.x, soldier.position.y, soldier.position.z)

    if (!isDead && drone) {
      const dx = drone.position.x - soldier.position.x
      const dz = drone.position.z - soldier.position.z
      groupRef.current.rotation.y = Math.atan2(dx, dz)
    }
  })

  if (soldier.visible === false) return null
  if (soldier.dead && soldier.deathTimer <= 0) return null

  return (
    <group ref={groupRef}>
      <AnimatedModel
        key={`${soldier.id}-${animKey}`}
        path={anim.path}
        targetSize={anim.targetSize}
        loop={anim.loop}
        fallback={<PlaceholderPig tint={tint} />}
      />
      {!isDead && <WeaponAk />}
    </group>
  )
}

export function PigSoldier({ soldier }: { soldier: Soldier }) {
  return <PigUnit soldier={soldier} tint="#f4a6b8" />
}

export function RedSoldier({ soldier }: { soldier: Soldier }) {
  return <PigUnit soldier={soldier} tint="#cc3333" />
}
