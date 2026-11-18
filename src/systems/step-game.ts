import { DIFFICULTIES } from '@/constants/difficulty'
import { checkAmmoGameOver, checkWin } from '@/systems/check-win'
import { tickSoldierDeathTimers } from '@/systems/soldier-death'
import { checkExplosion, updateParticles, updatePigParts, updateSmoke } from '@/systems/check-explosion'
import { dropMunition, updateMunitions } from '@/systems/update-munitions'
import { computeWind, updateDrone } from '@/systems/update-drone'
import { updateRats } from '@/systems/update-rats'
import { updateSoldiers } from '@/systems/update-soldiers'
import { filterBullets, updateBullets, updateEnemyDrones } from '@/systems/update-enemy-drones'
import { dist3 } from '@/utils/math'
import type { GameStoreState } from '@/stores/game-store'
import { fellTrees } from '@/systems/terrain-layout'
import type { GameState, InputState } from '@/types/game'

export function stepGame(state: GameStoreState, controls: InputState): Partial<GameStoreState> {
  if (state.gameState !== 'playing' || !state.drone || !state.levelData) return {}

  const drone = {
    ...state.drone,
    position: { ...state.drone.position },
    velocity: { ...state.drone.velocity },
  }
  const soldiers = state.soldiers.map((s) => ({
    ...s,
    position: { ...s.position },
    velocity: { ...s.velocity },
  }))
  const shelters = state.shelters.map((s) => ({
    ...s,
    position: { ...s.position },
    rats: s.rats.map((r) => ({ ...r })),
  }))
  const enemyDrones = state.enemyDrones.map((e) => ({ ...e, position: { ...e.position }, velocity: { ...e.velocity } }))
  const ewTowers = state.ewTowers.map((t) => ({ ...t, position: { ...t.position } }))
  let munitions = state.munitions.map((m) => ({
    ...m,
    position: { ...m.position },
    velocity: { ...m.velocity },
  }))
  let bullets = state.bullets.map((b) => ({ ...b, position: { ...b.position }, velocity: { ...b.velocity } }))
  let particles = [...state.particles]
  let smoke = [...state.smoke]
  let pigParts = [...state.pigParts]
  let score = state.score
  let shake = state.shake
  const frame = state.frame + 1
  let ewActive = false
  let inputInverted = false
  let inputDelay = 0

  const ds = DIFFICULTIES[state.difficulty]

  const windResult = computeWind({
    windPhase: state.windPhase,
    level: state.level,
    difficulty: state.difficulty,
    hasWind: state.levelData.wind,
  })

  for (const t of ewTowers) {
    if (t.dead) continue
    if (dist3(drone.position, t.position) < t.r) {
      ewActive = true
      if (ds.ewInvert) inputInverted = true
      inputDelay = ds.ewDelay
    }
  }

  const input = inputInverted
    ? { ...controls, altitude: -controls.altitude, yaw: -controls.yaw }
    : controls
  let fallenTrees = state.fallenTrees
  const blastMarks = state.blastMarks.filter(mark => frame - mark.frame < 600)
  function markBlast(x: number, z: number) {
    if (fallenTrees === state.fallenTrees) fallenTrees = fallenTrees.slice()
    fellTrees(state.level, fallenTrees, x, z)
    blastMarks.push({ id: `blast-${frame}-${blastMarks.length}`, frame, x, z })
  }

  if (state.dropQueued && drone.netTicks === 0) {
    const dropped = dropMunition(drone)
    if (dropped) munitions.push(dropped)
  }

  updateDrone({
    drone,
    input,
    wind: windResult.wind,
    levelData: state.levelData,
    ewActive,
    difficulty: state.difficulty,
  })

  const muniResult = updateMunitions({
    munitions,
    soldiers,
    shelters,
    wind: windResult.wind,
  })
  smoke.push(...muniResult.smoke)

  for (const impact of muniResult.impacts) {
    markBlast(impact.groundX, impact.groundZ)
    const fx = checkExplosion({
      x: impact.groundX,
      z: impact.groundZ,
      soldiers,
      shelters,
      enemyDrones,
      ewTowers,
    })
    score += fx.scoreDelta
    shake = Math.max(shake, fx.shake)
    particles.push(...fx.particles)
    smoke.push(...fx.smoke)
    pigParts.push(...fx.pigParts)
  }

  munitions = munitions.filter((m) => !m.done)

  const soldierResult = updateSoldiers({
    soldiers,
    drone,
    munitions,
    difficulty: state.difficulty,
    ewActive,
  })
  bullets.push(...soldierResult.bullets)
  score += soldierResult.scoreDelta
  if (soldierResult.droneDamage) drone.hp -= soldierResult.droneDamage
  if (soldierResult.droneHit) drone.hit = soldierResult.droneHit

  if (soldierResult.ramKills.length > 0) {
    const origin = soldierResult.ramKills[0].position
    markBlast(origin.x, origin.z)
    const fx = checkExplosion({
      x: origin.x,
      z: origin.z,
      soldiers,
      shelters,
      enemyDrones,
      ewTowers,
      forceBig: true,
    })
    score += fx.scoreDelta
    shake = Math.max(shake, fx.shake)
    particles.push(...fx.particles)
    smoke.push(...fx.smoke)
    pigParts.push(...fx.pigParts)
  }

  const cargoNets = updateEnemyDrones({
    enemyDrones, drone, frame, difficulty: state.difficulty,
    cargoNets: state.cargoNets.map(net => ({ ...net, position: { ...net.position } })),
  })

  const bulletResult = updateBullets({ bullets, drone })
  if (bulletResult.droneDamage) drone.hp -= bulletResult.droneDamage
  if (bulletResult.droneHit) drone.hit = bulletResult.droneHit
  particles.push(...bulletResult.sparks)
  bullets = filterBullets(bullets)

  tickSoldierDeathTimers(soldiers)
  updateRats({ shelters })

  particles = updateParticles(particles)
  smoke = updateSmoke(smoke)
  pigParts = updatePigParts(pigParts)

  if (shake > 0) shake *= 0.85

  let gameState: GameState = state.gameState
  if (drone.hp <= 0) {
    drone.hp = 0
    gameState = 'gameover'
  } else {
    const winResult = checkWin({
      levelData: state.levelData,
      level: state.level,
      soldiers,
      shelters,
      enemyDrones,
      ewTowers,
      devilDefeated: false,
    })
    if (winResult !== 'playing') gameState = winResult
    else if (
      checkAmmoGameOver({
        levelData: state.levelData,
        drone,
        munitions,
        won: false,
        shelters,
      })
    ) {
      gameState = 'gameover'
    }
  }

  return {
    cargoNets,
    fallenTrees,
    blastMarks,
    drone,
    soldiers,
    shelters,
    enemyDrones,
    ewTowers,
    munitions,
    bullets,
    particles,
    smoke,
    pigParts,
    score,
    shake,
    frame,
    wind: windResult.wind,
    windPhase: windResult.windPhase,
    ewActive,
    inputInverted,
    inputDelay,
    dropQueued: false,
    gameState,
  }
}
