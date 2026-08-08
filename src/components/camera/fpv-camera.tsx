import { useRef } from 'react'
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
  const smoothedPos = useRef(new THREE.Vector3())

  useFrame(() => {
    const drone = useGameStore.getState().drone
    if (!drone) return

    camera.near = 0.05

    droneForwardVector(drone.yaw, forward)

    const horizSpeed = Math.hypot(drone.velocity.x, drone.velocity.z)
    const speedT = Math.min(horizSpeed / DRONE_MAX_SPEED, 1)
    const lookAhead = LOOK_AHEAD_BASE + speedT * LOOK_AHEAD_SPEED

    const shakeX = shake > 0.5 ? (Math.random() - 0.5) * shake * 0.06 : 0
    const shakeY = shake > 0.5 ? (Math.random() - 0.5) * shake * 0.06 : 0

    desiredPos
      .copy(drone.position)
      .addScaledVector(forward, -CAM_BEHIND)
      .add(new THREE.Vector3(shakeX, CAM_ABOVE + shakeY, 0))

    smoothedPos.current.lerp(desiredPos, 0.72)
    camera.position.copy(smoothedPos.current)

    const lookDrop = LOOK_AT_DROP * (1 - speedT * 0.85)

    lookTarget
      .copy(drone.position)
      .addScaledVector(forward, lookAhead)
      .add(new THREE.Vector3(0, -lookDrop, 0))

    camera.up.copy(worldUp)
    camera.lookAt(lookTarget)
  })

  return null
}
