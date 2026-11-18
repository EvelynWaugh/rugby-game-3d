import { AdditiveBlending, BufferGeometry, Float32BufferAttribute } from 'three'
import type { Vec3 } from '@/types/game'

// Four tapered faces keep a thin profile from both the flight and impact cameras.
// The bright tip is at the event position. The dim tail points back along local -Z.
function makeStreak() {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute([
    0, 0, 0,   1, 0, -0.12,   0, 1, -0.12,   -1, 0, -0.12,   0, -1, -0.12,   0, 0, -1,
  ], 3))
  geometry.setAttribute('color', new Float32BufferAttribute([
    1, 1, 0.92,   1, 0.77, 0.36,   1, 0.77, 0.36,   1, 0.77, 0.36,   1, 0.77, 0.36,   0, 0, 0,
  ], 3))
  geometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 5, 2, 1, 5, 3, 2, 5, 4, 3, 5, 1, 4])
  return geometry
}

const streak = makeStreak()

interface LightStreakProps {
  position: Vec3
  velocity: Vec3
  length: number
  width: number
  opacity?: number
  color?: string
}

export function LightStreak({ position, velocity, length, width, opacity = 1, color = '#fff1cd' }: LightStreakProps) {
  const pitch = -Math.atan2(velocity.y, Math.hypot(velocity.x, velocity.z))
  const yaw = Math.atan2(velocity.x, velocity.z)
  return (
    <mesh geometry={streak} position={[position.x, position.y, position.z]}
      rotation={[pitch, yaw, 0, 'YXZ']} scale={[width, width, length]}>
      <meshBasicMaterial vertexColors color={color} blending={AdditiveBlending} transparent
        opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}
