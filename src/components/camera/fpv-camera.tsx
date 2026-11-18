import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { DRONE_MAX_SPEED } from '@/constants/game'
import { droneForwardVector } from '@/systems/update-drone'
import { useGameStore } from '@/stores/use-game-store'

const lookTarget = new THREE.Vector3()
const forward = new THREE.Vector3()
const desiredPos = new THREE.Vector3()
const worldUp = new THREE.Vector3(0, 1, 0)

const CAM_BEHIND = 0.52
const CAM_ABOVE = 0.5
/** Short look-ahead when still so the rear fuselage / rugby rack stays in frame */
const LOOK_AHEAD_BASE = 0.35
const LOOK_AHEAD_SPEED = 3.6
const LOOK_AT_DROP = 0.28

export function FpvCamera() {
  const { camera } = useThree()
  const shake = useGameStore((s) => s.shake)

  useFrame(() => {
    const { drone, downView, aftermath } = useGameStore.getState()
    if (!drone) return

    droneForwardVector(drone.yaw, forward)

    if (aftermath?.groundCrash) {
      camera.position.copy(drone.position).addScaledVector(forward, -6.8)
      camera.position.y += 3
      lookTarget.copy(drone.position)
      lookTarget.y += 1
      camera.up.copy(worldUp)
      camera.lookAt(lookTarget)
      return
    }

    if (downView) {
      camera.position.copy(drone.position)
      camera.position.y = Math.max(0.12, drone.position.y - 0.23)
      camera.up.copy(forward)
      lookTarget.copy(camera.position)
      lookTarget.y -= 1
      camera.lookAt(lookTarget)
      return
    }

    const horizSpeed = Math.hypot(drone.velocity.x, drone.velocity.z)
    const speedT = Math.min(horizSpeed / DRONE_MAX_SPEED, 1)
    const lookAhead = LOOK_AHEAD_BASE + speedT * LOOK_AHEAD_SPEED

    const shakeX = shake > 0.5 ? (Math.random() - 0.5) * shake * 0.06 : 0
    const shakeY = shake > 0.5 ? (Math.random() - 0.5) * shake * 0.06 : 0

    desiredPos
      .copy(drone.position)
      .addScaledVector(forward, -CAM_BEHIND)

    desiredPos.x += shakeX
    desiredPos.y += CAM_ABOVE + shakeY

    camera.position.copy(desiredPos)

    const lookDrop = LOOK_AT_DROP * (1 - speedT * 0.85)

    lookTarget
      .copy(drone.position)
      .addScaledVector(forward, lookAhead)

    lookTarget.y -= lookDrop

    camera.up.copy(worldUp)
    camera.lookAt(lookTarget)
  })

  return null
}
