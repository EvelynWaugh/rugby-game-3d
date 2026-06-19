import {
  DRONE_ACC,
  DRONE_FRICTION,
  DRONE_YAW_SPEED,
  LANE_HALF,
  MAX_ALTITUDE,
  MIN_ALTITUDE,
  PATH_BOOST_SPEED,
  PATH_CRUISE_SPEED,
  PATH_REVERSE_SPEED,
} from '@/constants/game'
import { DIFFICULTIES } from '@/constants/difficulty'
import { clampPathOffsets, samplePath } from '@/systems/path-system'
import { refreshDroneWorldPosition } from '@/systems/setup-level'
import type { Drone, InputState, LevelConfig, Wind } from '@/types/game'
import * as THREE from 'three'
import { clamp } from '@/utils/math'
import type { CatmullRomCurve3 } from 'three'

export function updateDrone({
  drone,
  curve,
  input,
  wind,
  levelData,
  ewActive,
  frame,
}: {
  drone: Drone
  curve: CatmullRomCurve3
  input: InputState
  wind: Wind
  levelData: LevelConfig
  ewActive: boolean
  frame: number
}) {
  if (drone.grounded > 0) {
    drone.grounded--
    drone.pathT += PATH_CRUISE_SPEED * 0.2
    refreshDroneWorldPosition(drone, curve)
    return
  }

  let forward = input.forward
  let lateral = input.lateral
  let altitude = input.altitude
  let yaw = input.yaw

  if (levelData.wind) {
    drone.lateralVel += wind.x * 0.08
    drone.altitudeVel += wind.z * 0.08
  }

  if (ewActive) {
    drone.lateralVel *= 1.045
    drone.altitudeVel *= 1.045
    if (frame % 10 === 0) {
      const ef = 0.9 + Math.random() * 2
      const ea = Math.random() * Math.PI * 2
      drone.lateralVel += Math.cos(ea) * ef * 0.1
      drone.altitudeVel += Math.sin(ea) * ef * 0.1
    }
  }

  let pathDelta = PATH_CRUISE_SPEED
  if (forward > 0) pathDelta += forward * PATH_BOOST_SPEED
  if (forward < 0) pathDelta += forward * PATH_REVERSE_SPEED
  drone.pathT = clamp(drone.pathT + pathDelta, 0, 1)

  drone.lateralVel += lateral * DRONE_ACC
  drone.altitudeVel += altitude * DRONE_ACC
  drone.yawVel += yaw * DRONE_YAW_SPEED
  drone.lateralVel *= DRONE_FRICTION
  drone.altitudeVel *= DRONE_FRICTION
  drone.yawVel *= DRONE_FRICTION

  drone.lateral += drone.lateralVel * 0.15
  drone.altitude += drone.altitudeVel * 0.12
  drone.yaw += drone.yawVel * 0.18

  const clamped = clampPathOffsets(drone.lateral, drone.altitude)
  drone.lateral = clamped.lateral
  drone.altitude = clamped.altitude

  if (Math.abs(drone.lateral) >= LANE_HALF) drone.lateralVel *= 0.5
  if (drone.altitude <= MIN_ALTITUDE || drone.altitude >= MAX_ALTITUDE) drone.altitudeVel *= 0.5

  refreshDroneWorldPosition(drone, curve)

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

export function getDroneRotation(curve: CatmullRomCurve3, drone: Drone) {
  const sample = samplePath({
    curve,
    pathT: drone.pathT,
    lateral: drone.lateral,
    altitude: drone.altitude,
  })
  const rotation = new THREE.Euler().copy(sample.rotation)
  rotation.y += drone.yaw
  return rotation
}
