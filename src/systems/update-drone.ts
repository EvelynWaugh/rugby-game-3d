import { DIFFICULTIES } from '@/constants/difficulty'
import {
  DRONE_ALTITUDE_THRUST,
  DRONE_BATTERY_DRAIN,
  DRONE_CRUISE_SPEED,
  DRONE_FRICTION,
  DRONE_LATERAL_DAMP,
  DRONE_MAX_SPEED,
  DRONE_MAX_VERTICAL_SPEED,
  DRONE_THRUST,
  DRONE_VERTICAL_FRICTION,
  DRONE_YAW_ACCEL,
  DRONE_YAW_DAMPING,
  DRONE_YAW_MAX,
  MAX_ALTITUDE,
  MIN_ALTITUDE,
} from '@/constants/game'
import type { Drone, InputState, LevelConfig, Wind } from '@/types/game'
import { clamp } from '@/utils/math'
import * as THREE from 'three'

const forwardDir = new THREE.Vector3()
const rightDir = new THREE.Vector3()

export function droneForwardVector(yaw: number, out = forwardDir) {
  out.set(Math.sin(yaw), 0, -Math.cos(yaw))
  return out
}

export function droneRightVector(yaw: number, out = rightDir) {
  out.set(Math.cos(yaw), 0, Math.sin(yaw))
  return out
}

function decomposeHorizVelocity(drone: Drone, yaw: number) {
  const fwd = droneForwardVector(yaw)
  const right = droneRightVector(yaw)
  return {
    forwardSpeed: drone.velocity.x * fwd.x + drone.velocity.z * fwd.z,
    lateralSpeed: drone.velocity.x * right.x + drone.velocity.z * right.z,
  }
}

function setHorizVelocity(drone: Drone, yaw: number, forwardSpeed: number, lateralSpeed: number) {
  const fwd = droneForwardVector(yaw)
  const right = droneRightVector(yaw)
  drone.velocity.x = fwd.x * forwardSpeed + right.x * lateralSpeed
  drone.velocity.z = fwd.z * forwardSpeed + right.z * lateralSpeed
}

export function updateDrone({
  drone,
  input,
  wind,
  levelData,
  ewActive,
  frame,
  difficulty,
}: {
  drone: Drone
  input: InputState
  wind: Wind
  levelData: LevelConfig
  ewActive: boolean
  frame: number
  difficulty: keyof typeof DIFFICULTIES
}) {
  if (drone.grounded > 0) {
    drone.grounded--
    const { forwardSpeed, lateralSpeed } = decomposeHorizVelocity(drone, drone.yaw)
    setHorizVelocity(drone, drone.yaw, forwardSpeed * 0.9, lateralSpeed * 0.35)
    drone.yawVel *= 0.85
    drone.position.x += drone.velocity.x
    drone.position.z += drone.velocity.z
    return
  }

  const horizSpeed = Math.hypot(drone.velocity.x, drone.velocity.z)

  if (input.yaw !== 0) {
    drone.yawVel += input.yaw * DRONE_YAW_ACCEL
  }

  drone.yawVel *= DRONE_YAW_DAMPING
  drone.yawVel = clamp(drone.yawVel, -DRONE_YAW_MAX, DRONE_YAW_MAX)

  const turnScale = 0.35 + 0.65 * Math.min(horizSpeed / DRONE_MAX_SPEED, 1)
  drone.yaw += drone.yawVel * turnScale

  const fwd = droneForwardVector(drone.yaw)

  if (input.forward !== 0) {
    drone.velocity.x += fwd.x * input.forward * DRONE_THRUST
    drone.velocity.z += fwd.z * input.forward * DRONE_THRUST
  }

  if (input.altitude !== 0)
    drone.velocity.y += input.altitude * DRONE_ALTITUDE_THRUST

  if (levelData.wind) {
    drone.velocity.x += wind.x * 0.006
    drone.velocity.z += wind.z * 0.003
  }

  if (ewActive && frame % 10 === 0) {
    drone.velocity.x += (Math.random() - 0.5) * 0.012
    drone.velocity.z += (Math.random() - 0.5) * 0.012
  }

  let { forwardSpeed, lateralSpeed } = decomposeHorizVelocity(drone, drone.yaw)
  lateralSpeed *= 1 - DRONE_LATERAL_DAMP
  forwardSpeed *= DRONE_FRICTION
  lateralSpeed *= DRONE_FRICTION
  if (input.forward === 0)
    forwardSpeed += (DRONE_CRUISE_SPEED - forwardSpeed) * 0.12
  drone.velocity.y *= DRONE_VERTICAL_FRICTION
  drone.velocity.y = clamp(drone.velocity.y, -DRONE_MAX_VERTICAL_SPEED, DRONE_MAX_VERTICAL_SPEED)

  const cappedHoriz = Math.hypot(forwardSpeed, lateralSpeed)
  if (cappedHoriz > DRONE_MAX_SPEED) {
    const scale = DRONE_MAX_SPEED / cappedHoriz
    forwardSpeed *= scale
    lateralSpeed *= scale
  }

  setHorizVelocity(drone, drone.yaw, forwardSpeed, lateralSpeed)

  drone.position.x += drone.velocity.x
  drone.position.y += drone.velocity.y
  drone.position.z += drone.velocity.z

  const prevY = drone.position.y
  drone.position.y = clamp(drone.position.y, MIN_ALTITUDE, MAX_ALTITUDE)
  if (drone.position.y !== prevY) drone.velocity.y *= 0.35

  drone.altitude = drone.position.y

  // Motors stay on while airborne — drain on hover and extra while moving
  const drain = DRONE_BATTERY_DRAIN * DIFFICULTIES[difficulty].battery
  drone.hp -= drain * (0.85 + horizSpeed * 0.35 + Math.abs(drone.velocity.y) * 0.1)

  if (drone.hit > 0) drone.hit--
}

export function computeWind({
  windPhase,
  level,
  difficulty,
  hasWind,
}: {
  windPhase: number
  level: number
  difficulty: keyof typeof DIFFICULTIES
  hasWind: boolean
}): { wind: Wind; windPhase: number } {
  if (!hasWind) return { wind: { x: 0, z: 0 }, windPhase }

  const ds = DIFFICULTIES[difficulty]
  const nextPhase = windPhase + 0.008
  const wind: Wind = {
    x: (Math.sin(nextPhase) * 1.4 + (level >= 5 ? Math.sin(nextPhase * 2.3) * 0.8 : 0)) * ds.wind,
    z: Math.cos(nextPhase * 0.7) * 0.5 * ds.wind,
  }
  return { wind, windPhase: nextPhase }
}

export function getDroneAttitude(drone: Drone) {
  const fwd = droneForwardVector(drone.yaw)
  const forwardSpeed = drone.velocity.x * fwd.x + drone.velocity.z * fwd.z
  const pitch = clamp(-drone.velocity.y * 0.08 + forwardSpeed * 0.05, -0.25, 0.25)
  const bank = clamp(drone.yawVel * 12, -0.35, 0.35)
  return { pitch, bank }
}

const droneEuler = new THREE.Euler()
const droneQuat = new THREE.Quaternion()

export function getDroneQuaternion(drone: Drone, out = droneQuat) {
  const { pitch, bank } = getDroneAttitude(drone)
  droneEuler.set(pitch, drone.yaw, bank, 'YXZ')
  return out.setFromEuler(droneEuler)
}
