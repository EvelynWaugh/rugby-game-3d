import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { PigAnimatedModel } from '@/components/models/pig-animated-model'
import { WeaponAk } from '@/components/models/weapon-ak'
import { type PigAnimKey } from '@/constants/models'
import type { Soldier } from '@/types/game'
import { useGameStore } from '@/stores/use-game-store'

interface PigUnitProps {
  soldierId: string
  tint?: string
}

function pickAnimKey(soldier: Soldier): PigAnimKey {
  if (soldier.dead) {
    return soldier.deathVariant === 'shot' ? 'deathShot' : 'deathAbdominal'
  }
  if (soldier.behavior === 'shoot') return 'shoot'
  if (soldier.behavior === 'flee') return 'run'
  if (soldier.behavior === 'aim') return 'aim'
  return 'walkGun'
}

function showWeapon(soldier: Soldier, animKey: PigAnimKey) {
  if (soldier.dead || soldier.weaponDropped) return false
  if (animKey === 'aim' || animKey === 'shoot' || animKey === 'run') return false
  return true
}

function PlaceholderPig({ tint = '#f4a6b8' }: { tint?: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.25, 0.7, 4, 8]} />
        <meshStandardMaterial color={tint} />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0.15]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color={tint} />
      </mesh>
    </group>
  )
}

export function PigUnit({ soldierId, tint }: PigUnitProps) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    const soldier = useGameStore.getState().soldiers.find((s) => s.id === soldierId)
    if (!soldier || !groupRef.current) return
    if (soldier.dead && soldier.deathTimer <= 0) return

    groupRef.current.position.set(soldier.position.x, soldier.position.y, soldier.position.z)

    const drone = useGameStore.getState().drone
    if (!soldier.dead && drone) {
      const dx = drone.position.x - soldier.position.x
      const dz = drone.position.z - soldier.position.z
      groupRef.current.rotation.y = Math.atan2(dx, dz)
    }
  })

  const soldier = useGameStore((s) => s.soldiers.find((x) => x.id === soldierId))
  if (!soldier || soldier.visible === false) return null
  if (soldier.dead && soldier.deathTimer <= 0) return null

  const animKey = pickAnimKey(soldier)

  return (
    <group ref={groupRef}>
      <PigAnimatedModel
        animKey={animKey}
        fallback={<PlaceholderPig tint={tint} />}
      />
      {showWeapon(soldier, animKey) && <WeaponAk />}
    </group>
  )
}

export function PigSoldier({ soldier }: { soldier: Soldier }) {
  return <PigUnit soldierId={soldier.id} tint="#f4a6b8" />
}

export function RedSoldier({ soldier }: { soldier: Soldier }) {
  return <PigUnit soldierId={soldier.id} tint="#cc3333" />
}
