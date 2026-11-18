import { MIN_ALTITUDE } from '@/constants/game'
import { PIG_DEATH_FRAMES } from '@/constants/models'
import { DIFFICULTIES } from '@/constants/difficulty'
import { checkAmmoGameOver, checkWin } from '@/systems/check-win'
import { tickSoldierDeathTimers } from '@/systems/soldier-death'
import { checkExplosion, updateParticles } from '@/systems/check-explosion'
import { dropMunition, updateMunitions } from '@/systems/update-munitions'
import { computeWind, updateDrone } from '@/systems/update-drone'
import { updateRats } from '@/systems/update-rats'
import { updateSoldiers } from '@/systems/update-soldiers'
import { filterBullets, updateBullets, updateEnemyDrones } from '@/systems/update-enemy-drones'
import { dist3 } from '@/utils/math'
import type { GameStoreState } from '@/stores/game-store'
import { fellTrees } from '@/systems/terrain-layout'
import type { BlastMark, GameState, InputState } from '@/types/game'

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
  let impactView = state.impactView && state.frame + 1 < state.impactView.untilFrame ? state.impactView : null
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
  function detonate(x: number, z: number, kind: BlastMark['kind']) {
    if (fallenTrees === state.fallenTrees) fallenTrees = fallenTrees.slice()
    fellTrees(state.level, fallenTrees, x, z)
    blastMarks.push({ id: `blast-${frame}-${blastMarks.length}`, frame, kind, x, z })
    const fx = checkExplosion({ x, z, soldiers, shelters, enemyDrones, ewTowers })
    score += fx.scoreDelta
    shake = Math.max(shake, fx.shake)
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

  if (drone.position.y <= MIN_ALTITUDE && drone.hp <= 0) {
    drone.hp = 0
    drone.velocity = { x: 0, y: 0, z: 0 }
    // The crash burst is visual. A failed flight cannot earn more points.
    blastMarks.push({ id: `crash-${frame}`, frame, kind: 'crash', x: drone.position.x, z: drone.position.z })
    return {
      drone, frame, blastMarks, downView: false, impactView: null, dropQueued: false,
      gameState: 'aftermath', aftermath: { result: 'gameover', groundCrash: true, untilFrame: frame + 120 },
    }
  }

  const muniResult = updateMunitions({
    munitions,
    soldiers,
    shelters,
    wind: windResult.wind,
  })

  for (const impact of muniResult.impacts)
    detonate(impact.groundX, impact.groundZ, 'munition')

  munitions = munitions.filter((m) => !m.done)

  const soldierResult = updateSoldiers({
    frame,
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
    const subject = soldierResult.ramKills[0]
    impactView = { soldierId: subject.id, yaw: drone.yaw, untilFrame: frame + PIG_DEATH_FRAMES + 24 }
    const origin = subject.position
    detonate(origin.x, origin.z, 'ram')
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

  // Let the last fall or blast finish before a result screen covers the scene.
  const untilFrame = impactView?.untilFrame ?? (muniResult.impacts.length ? frame + 72 : frame)
  const aftermath = gameState !== 'playing' && untilFrame > frame
    ? { result: gameState, untilFrame, groundCrash: false }
    : null

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
    impactView,
    aftermath,
    score,
    shake,
    frame,
    wind: windResult.wind,
    windPhase: windResult.windPhase,
    ewActive,
    inputInverted,
    inputDelay,
    dropQueued: false,
    gameState: aftermath ? 'aftermath' : gameState,
  }
}

export function advanceAftermath(state: GameStoreState, elapsedTicks: number): Partial<GameStoreState> {
  if (!state.aftermath) return {}
  const frame = Math.min(state.frame + elapsedTicks, state.aftermath.untilFrame)
  if (frame >= state.aftermath.untilFrame)
    return { frame, gameState: state.aftermath.result, aftermath: null, impactView: null, shake: 0 }
  return { frame, shake: 0 }
}
