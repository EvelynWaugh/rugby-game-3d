import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group } from 'three'
import type { Bullet } from '@/types/game'

const aim = new THREE.Vector3()

interface BulletsProps {
  bullets: Bullet[]
}

export function Bullets({ bullets }: BulletsProps) {
  return (
    <group>
      {bullets.map((bullet) => (
        <BulletTracer key={bullet.id} bullet={bullet} />
      ))}
    </group>
  )
}

function BulletTracer({ bullet }: { bullet: Bullet }) {
  const groupRef = useRef<Group>(null)
  const color = bullet.enemy ? '#ff7a3c' : '#7fdfff'

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    group.position.set(bullet.position.x, bullet.position.y, bullet.position.z)
    aim.set(
      bullet.position.x + bullet.velocity.x,
      bullet.position.y + bullet.velocity.y,
      bullet.position.z + bullet.velocity.z,
    )
    group.lookAt(aim)
  })

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.03, 0.22, 3, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshBasicMaterial color="#ffe6a3" />
      </mesh>
    </group>
  )
}
