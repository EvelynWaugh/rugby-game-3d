import * as THREE from 'three'
import { LANE_HALF, MAX_ALTITUDE, MIN_ALTITUDE } from '@/constants/game'
import { clamp } from '@/utils/math'

export interface PathSample {
  position: THREE.Vector3
  tangent: THREE.Vector3
  right: THREE.Vector3
  up: THREE.Vector3
  rotation: THREE.Euler
}

const levelPaths = new Map<number, THREE.CatmullRomCurve3>()

function createOutskirtsPath(): THREE.CatmullRomCurve3 {
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(15, 2, -80),
    new THREE.Vector3(-20, 3, -160),
    new THREE.Vector3(25, 1, -240),
    new THREE.Vector3(-10, 4, -320),
    new THREE.Vector3(30, 2, -400),
    new THREE.Vector3(0, 0, -480),
  ]
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
}

export function getLevelPath(levelId: number): THREE.CatmullRomCurve3 {
  const cached = levelPaths.get(levelId)
  if (cached) return cached

  const curve = createOutskirtsPath()
  levelPaths.set(levelId, curve)
  return curve
}

export function samplePath({
  curve,
  pathT,
  lateral,
  altitude,
}: {
  curve: THREE.CatmullRomCurve3
  pathT: number
  lateral: number
  altitude: number
}): PathSample {
  const t = clamp(pathT, 0, 1)
  const position = curve.getPointAt(t)
  const tangent = curve.getTangentAt(t).normalize()
  const worldUp = new THREE.Vector3(0, 1, 0)
  const right = new THREE.Vector3().crossVectors(tangent, worldUp).normalize()
  if (right.lengthSq() < 0.001) right.set(1, 0, 0)
  const up = new THREE.Vector3().crossVectors(right, tangent).normalize()

  position.addScaledVector(right, lateral)
  position.addScaledVector(up, altitude)

  const lookTarget = position.clone().add(tangent)
  const matrix = new THREE.Matrix4().lookAt(position, lookTarget, up)
  const rotation = new THREE.Euler().setFromRotationMatrix(matrix)

  return { position, tangent, right, up, rotation }
}

export function clampPathOffsets(lateral: number, altitude: number) {
  return {
    lateral: clamp(lateral, -LANE_HALF, LANE_HALF),
    altitude: clamp(altitude, MIN_ALTITUDE, MAX_ALTITUDE),
  }
}

export function spawnAlongPath({
  curve,
  pathT,
  lateral,
  groundY = 0,
}: {
  curve: THREE.CatmullRomCurve3
  pathT: number
  lateral: number
  groundY?: number
}) {
  const sample = samplePath({ curve, pathT, lateral, altitude: 0 })
  return {
    x: sample.position.x,
    y: groundY,
    z: sample.position.z,
  }
}
