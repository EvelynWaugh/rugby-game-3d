import { DIFFICULTIES } from '@/constants/difficulty'
import { DRONE_CRUISE_SPEED, PIG_WALK_SPEED, RAT_WALK_SPEED } from '@/constants/game'
import { SHELTER_INTERIOR_RATIO, SHELTER_WORLD } from '@/constants/models'
import { droneForwardVector } from '@/systems/update-drone'
import { getLevelPath, samplePath, spawnAlongPath } from '@/systems/path-system'
import type { DifficultyKey, Drone, EnemyDrone, EwTower, LevelConfig, Rat, Shelter, Soldier } from '@/types/game'
import { rand, uid } from '@/utils/math'
import type { CatmullRomCurve3 } from 'three'

export function makeDrone(difficulty: DifficultyKey, curve: CatmullRomCurve3, muni = 0, hasBigBall = false): Drone {
  const maxhp = Math.round(100 * DIFFICULTIES[difficulty].battery)
  const pathT = 0.02
  const sample = samplePath({ curve, pathT, lateral: 0, altitude: 0 })
  const yaw = Math.atan2(sample.tangent.x, -sample.tangent.z)
  const fwd = droneForwardVector(yaw)

  return {
    position: { x: sample.position.x, y: 12, z: sample.position.z },
    velocity: { x: fwd.x * DRONE_CRUISE_SPEED, y: 0, z: fwd.z * DRONE_CRUISE_SPEED },
    hp: maxhp,
    maxhp,
    munitions: muni,
    hasBigBall,
    hit: 0,
    pathT,
    lateral: 0,
    altitude: 12,
    lateralVel: 0,
    altitudeVel: 0,
    yaw,
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

function evenPathT(index: number, total: number, min = 0.12, max = 0.97) {
  if (total <= 1) return (min + max) / 2
  return min + (index / (total - 1)) * (max - min)
}

function clampSpawn(t: number) {
  return Math.max(0.12, Math.min(0.95, t))
}

function makeSoldier({
  idPrefix,
  pos,
  pig,
  hp,
  walkSpeed,
  coolScale,
  cowardChance,
  catchChance,
  lvImmune,
}: {
  idPrefix: string
  pos: { x: number; y: number; z: number }
  pig: boolean
  hp: number
  walkSpeed: number
  coolScale: number
  cowardChance: number
  catchChance: number
  lvImmune: boolean
}): Soldier {
  const angle = rand(0, Math.PI * 2)
  const cowardly = Math.random() < cowardChance
  return {
    id: uid(idPrefix),
    position: { ...pos },
    spawnPosition: { ...pos },
    velocity: { x: Math.sin(angle) * walkSpeed, y: 0, z: Math.cos(angle) * walkSpeed },
    hp,
    maxhp: hp,
    cool: rand(60, 180) * coolScale,
    dead: false,
    pig,
    immune: lvImmune,
    visible: true,
    behavior: 'biped',
    cowardly,
    catcher: !cowardly && Math.random() < catchChance,
    weaponDropped: false,
    shootTimer: 0,
    fireCool: 0,
    catchTimer: 0,
    jamOff: 0,
    deathTimer: 0,
    deathVariant: 'shot',
  }
}

function makeRat({ halfX, halfZ }: { halfX: number; halfZ: number }): Rat {
  const angle = rand(0, Math.PI * 2)
  return {
    ox: rand(-halfX, halfX),
    oz: rand(-halfZ, halfZ),
    vx: Math.sin(angle) * RAT_WALK_SPEED,
    vz: Math.cos(angle) * RAT_WALK_SPEED,
    dead: false,
    phase: rand(0, Math.PI * 2),
  }
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

  const totalPigs = levelData.soldiers + (levelData.reds || 0)
  const onRoad = level === 1
  let redBudget = 0

  for (let i = 0; i < totalPigs; i++) {
    const redsLeft = (levelData.reds || 0) - redBudget
    const spawnRed = redsLeft > 0 && (i + 1) * (levelData.reds || 0) > redBudget * totalPigs
    if (spawnRed) redBudget++

    const side = i % 2 === 0 ? -1 : 1
    const lateral = onRoad
      ? side * (1.6 + (i % 4) * 0.55)
      : rand(-16, 16)
    const pos = spawnAlongPath({
      curve,
      pathT: evenPathT(i, totalPigs, 0.12, 0.97),
      lateral,
    })

    soldiers.push(
      spawnRed
        ? makeSoldier({
            idPrefix: 'red',
            pos,
            pig: false,
            hp: 2,
            walkSpeed: PIG_WALK_SPEED * 0.7,
            coolScale: ds.enemyRate,
            cowardChance: 0.3,
            catchChance: 0.45,
            lvImmune,
          })
        : makeSoldier({
            idPrefix: 'pig',
            pos,
            pig: true,
            hp: 1,
            walkSpeed: PIG_WALK_SPEED,
            coolScale: ds.enemyRate,
            cowardChance: 0.4,
            catchChance: 0.5,
            lvImmune,
          }),
    )
  }

  const { w, h, d } = SHELTER_WORLD
  const halfX = (w / 2) * SHELTER_INTERIOR_RATIO
  const halfZ = (d / 2) * SHELTER_INTERIOR_RATIO

  for (let i = 0; i < levelData.shelters; i++) {
    const pathT = evenPathT(i, Math.max(levelData.shelters, 1), 0.32, 0.78)
    const lateral = (i % 2 === 0 ? -1 : 1) * rand(11, 15)
    const sample = samplePath({ curve, pathT, lateral, altitude: 0 })
    const numRats = 4
    const rats: Rat[] = []
    for (let r = 0; r < numRats; r++) rats.push(makeRat({ halfX, halfZ }))

    shelters.push({
      id: uid('shelter'),
      position: { x: sample.position.x, y: 0, z: sample.position.z },
      hp: 60,
      maxhp: 60,
      w,
      d,
      h,
      yaw: Math.atan2(sample.tangent.x, -sample.tangent.z),
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
