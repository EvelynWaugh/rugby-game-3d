import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { DRONE_MAX_SPEED } from '@/constants/game'
import { droneForwardVector } from '@/systems/update-drone'
import { useGameStore } from '@/stores/use-game-store'

const lookTarget = new THREE.Vector3()
const forward = new THREE.Vector3()
const up = new THREE.Vector3(0, 1, 0)
const lookMatrix = new THREE.Matrix4()
const targetQuaternion = new THREE.Quaternion()

/** Camera sits behind/above the drone; look target stays close so the body stays in frame */
const CAM_BEHIND = 0.42
const CAM_ABOVE = 0.55
const LOOK_AHEAD_BASE = 2.6
const LOOK_AHEAD_SPEED = 4

export function FpvCamera() {
  const { camera } = useThree()
  const shake = useGameStore((s) => s.shake)
  const desiredPos = useRef(new THREE.Vector3())
  const desiredLook = useRef(new THREE.Vector3())

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

    desiredPos.current
      .copy(drone.position)
      .addScaledVector(forward, -CAM_BEHIND)
      .addScaledVector(up, CAM_ABOVE + shakeY)
      .add(new THREE.Vector3(shakeX, 0, 0))

    lookTarget
      .copy(drone.position)
      .addScaledVector(forward, lookAhead)
      .addScaledVector(up, 0.04)
    desiredLook.current.copy(lookTarget)

    camera.position.lerp(desiredPos.current, 0.4)

    lookMatrix.lookAt(camera.position, desiredLook.current, up)
    targetQuaternion.setFromRotationMatrix(lookMatrix)
    camera.quaternion.slerp(targetQuaternion, 0.4)
  })

  return null
}
