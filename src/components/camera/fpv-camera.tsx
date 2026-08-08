import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { DRONE_MAX_SPEED } from '@/constants/game'
import { getDroneQuaternion } from '@/systems/update-drone'
import { useGameStore } from '@/stores/use-game-store'

const lookTarget = new THREE.Vector3()
const noseDir = new THREE.Vector3()
const camOffset = new THREE.Vector3()
const up = new THREE.Vector3(0, 1, 0)
const droneQuat = new THREE.Quaternion()

const CAM_BEHIND = 0.42
const CAM_ABOVE = 0.55
const LOOK_AHEAD_BASE = 2.6
const LOOK_AHEAD_SPEED = 4

export function FpvCamera() {
  const { camera } = useThree()
  const shake = useGameStore((s) => s.shake)
  const desiredPos = useRef(new THREE.Vector3())

  useFrame(() => {
    const drone = useGameStore.getState().drone
    if (!drone) return

    camera.near = 0.05

    getDroneQuaternion(drone, droneQuat)

    const horizSpeed = Math.hypot(drone.velocity.x, drone.velocity.z)
    const speedT = Math.min(horizSpeed / DRONE_MAX_SPEED, 1)
    const lookAhead = LOOK_AHEAD_BASE + speedT * LOOK_AHEAD_SPEED

    const shakeX = shake > 0.5 ? (Math.random() - 0.5) * shake * 0.06 : 0
    const shakeY = shake > 0.5 ? (Math.random() - 0.5) * shake * 0.06 : 0

    camOffset.set(shakeX, CAM_ABOVE + shakeY, CAM_BEHIND).applyQuaternion(droneQuat)

    desiredPos.current.copy(drone.position).add(camOffset)
    camera.position.lerp(desiredPos.current, 0.72)

    noseDir.set(0, 0, -1).applyQuaternion(droneQuat)
    lookTarget.copy(drone.position).addScaledVector(noseDir, lookAhead)
    up.set(0, 1, 0).applyQuaternion(droneQuat)
    camera.up.copy(up)
    camera.lookAt(lookTarget)
  })

  return null
}
