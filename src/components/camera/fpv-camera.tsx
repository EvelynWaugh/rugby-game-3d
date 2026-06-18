import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getDroneRotation } from '@/systems/update-drone'
import { getActiveCurve } from '@/systems/setup-level'
import { useGameStore } from '@/stores/use-game-store'

const cameraOffset = new THREE.Vector3(0, 0.35, 0.15)
const lookAhead = new THREE.Vector3()
const forward = new THREE.Vector3()
const up = new THREE.Vector3(0, 1, 0)
const euler = new THREE.Euler()
const lookMatrix = new THREE.Matrix4()
const targetQuaternion = new THREE.Quaternion()
const rollQuaternion = new THREE.Quaternion()

export function FpvCamera() {
  const { camera } = useThree()
  const shake = useGameStore((s) => s.shake)
  const level = useGameStore((s) => s.level)
  const lateralVel = useGameStore((s) => s.drone?.lateralVel ?? 0)
  const desiredPos = useRef(new THREE.Vector3())
  const desiredLook = useRef(new THREE.Vector3())

  useFrame(() => {
    const drone = useGameStore.getState().drone
    if (!drone) return

    const curve = getActiveCurve(level)
    const rot = getDroneRotation(curve, drone)
    euler.set(rot.x, rot.y, rot.z)
    forward.set(0, 0, -1).applyEuler(euler).normalize()

    const shakeX = shake > 0.5 ? (Math.random() - 0.5) * shake * 0.08 : 0
    const shakeY = shake > 0.5 ? (Math.random() - 0.5) * shake * 0.08 : 0

    desiredPos.current
      .copy(drone.position)
      .addScaledVector(forward, cameraOffset.z)
      .add(new THREE.Vector3(0, cameraOffset.y + shakeY, 0))
      .add(new THREE.Vector3(shakeX, 0, 0))

    lookAhead.copy(forward).multiplyScalar(30)
    desiredLook.current.copy(drone.position).add(lookAhead)

    camera.position.lerp(desiredPos.current, 0.25)

    lookMatrix.lookAt(camera.position, desiredLook.current, up)
    targetQuaternion.setFromRotationMatrix(lookMatrix)

    const roll = THREE.MathUtils.clamp(-lateralVel * 0.015, -0.35, 0.35)
    rollQuaternion.setFromAxisAngle(forward, roll)
    targetQuaternion.multiply(rollQuaternion)

    camera.quaternion.slerp(targetQuaternion, 0.25)
  })

  return null
}
