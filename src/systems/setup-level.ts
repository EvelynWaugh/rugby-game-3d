import { DIFFICULTIES } from '@/constants/difficulty'
import { getLevelPath, samplePath, spawnAlongPath } from '@/systems/path-system'
import type { DifficultyKey, Drone, EnemyDrone, EwTower, LevelConfig, Shelter, Soldier } from '@/types/game'
import { rand, uid } from '@/utils/math'
import type { CatmullRomCurve3 } from 'three'

export function makeDrone(difficulty: DifficultyKey, curve: CatmullRomCurve3, muni = 0, hasBigBall = false): Drone {
  const maxhp = Math.round(100 * DIFFICULTIES[difficulty].battery)
  const pathT = 0.02
  const lateral = 0
  const altitude = 12
  const sample = samplePath({ curve, pathT, lateral, altitude })

  return {
    position: { x: sample.position.x, y: sample.position.y, z: sample.position.z },
    velocity: { x: 0, y: 0, z: 0 },
    hp: maxhp,
    maxhp,
    munitions: muni,
    hasBigBall,
    hit: 0,
    pathT,
    lateral,
    altitude,
    lateralVel: 0,
    altitudeVel: 0,
    yaw: 0,
    yawVel: 0,
    grounded: 0,
  }
}

export function refreshDroneWorldPosition(drone: Drone, curve: CatmullRomCurve3) {
  const sample = samplePath({
    curve,
    pathT: drone.pathT,
    lateral: drone.lateral,
    altitude: drone.altitude,
  })
  drone.position.x = sample.position.x
  drone.position.y = sample.position.y
  drone.position.z = sample.position.z
  drone.velocity.x = sample.tangent.x
  drone.velocity.y = sample.tangent.y
  drone.velocity.z = sample.tangent.z
}

function randomPathT(index: number, total: number, min = 0.15, max = 0.92) {
  const step = (max - min) / Math.max(total, 1)
  return clampSpawn(min + step * index + rand(-0.03, 0.03))
}

function clampSpawn(t: number) {
  return Math.max(0.12, Math.min(0.95, t))
}

export function spawnEntitiesForLevel({
  level,
  levelData,
  difficulty,
  curve,
}: {
  level: number
  levelData: LevelConfig
  difficulty: DifficultyKey
  curve: CatmullRomCurve3
}) {
  const ds = DIFFICULTIES[difficulty]
  const lvImmune = level === 5
  const soldiers: Soldier[] = []
  const shelters: Shelter[] = []
  const enemyDrones: EnemyDrone[] = []
  const ewTowers: EwTower[] = []

  for (let i = 0; i < levelData.soldiers; i++) {
    const spd = 0.9
    const pos = spawnAlongPath({
      curve,
      pathT: randomPathT(i, levelData.soldiers + levelData.reds + levelData.shelters),
      lateral: rand(-18, 18),
    })
    soldiers.push({
      id: uid('pig'),
      position: pos,
      velocity: { x: rand(-spd, spd), y: 0, z: rand(-spd, spd) },
      hp: 1,
      maxhp: 1,
      cool: rand(60, 180) * ds.enemyRate,
      dead: false,
      pig: true,
      immune: lvImmune,
      visible: true,
      behavior: 'biped',
      jamOff: 0,
      deathTimer: 0,
      deathVariant: 'shot',
    })
  }

  for (let i = 0; i < (levelData.reds || 0); i++) {
    const spd = 0.55
    const pos = spawnAlongPath({
      curve,
      pathT: randomPathT(i + levelData.soldiers, levelData.soldiers + levelData.reds + levelData.shelters),
      lateral: rand(-18, 18),
    })
    soldiers.push({
      id: uid('red'),
      position: pos,
      velocity: { x: rand(-spd, spd), y: 0, z: rand(-spd, spd) },
      hp: 2,
      maxhp: 2,
      cool: rand(50, 150) * ds.enemyRate,
      dead: false,
      pig: false,
      immune: lvImmune,
      visible: true,
      behavior: 'biped',
      jamOff: 0,
      deathTimer: 0,
      deathVariant: 'shot',
    })
  }

  for (let i = 0; i < levelData.shelters; i++) {
    const w = 4.6
    const h = 3.8
    const pos = spawnAlongPath({
      curve,
      pathT: randomPathT(i, levelData.shelters, 0.25, 0.85),
      lateral: rand(-12, 12),
      groundY: 0,
    })
    const rats = []
    const numRats = Math.floor(rand(2, 5))
    for (let r = 0; r < numRats; r++) {
      rats.push({
        ox: rand(-w / 2 + 1.4, w / 2 - 1.4),
        oy: rand(-h / 2 + 1.2, h / 2 - 1.2),
        dead: false,
        phase: rand(0, Math.PI * 2),
      })
    }
    shelters.push({
      id: uid('shelter'),
      position: { x: pos.x, y: 0.5, z: pos.z },
      hp: 60,
      maxhp: 60,
      w,
      h,
      dead: false,
      command: false,
      rats,
    })
  }

  for (let i = 0; i < levelData.drones; i++) {
    const pos = spawnAlongPath({
      curve,
      pathT: randomPathT(i, levelData.drones, 0.2, 0.9),
      lateral: rand(-20, 20),
      groundY: 8,
    })
    pos.y = 8
    enemyDrones.push({
      id: uid('edrone'),
      position: pos,
      velocity: { x: 0, y: 0, z: 0 },
      hp: 2,
      cool: rand(40, 120) * ds.enemyRate,
      dead: false,
      immune: lvImmune,
      visible: true,
      jamOff: 0,
    })
  }

  for (let i = 0; i < levelData.ew; i++) {
    const pos = spawnAlongPath({
      curve,
      pathT: randomPathT(i, levelData.ew, 0.3, 0.88),
      lateral: rand(-15, 15),
    })
    ewTowers.push({
      id: uid('ew'),
      position: { x: pos.x, y: 1, z: pos.z },
      r: rand(9, 13),
      hp: 30,
      maxhp: 30,
      dead: false,
      immune: lvImmune,
    })
  }

  return { soldiers, shelters, enemyDrones, ewTowers }
}

export function getActiveCurve(level: number) {
  return getLevelPath(level)
}
