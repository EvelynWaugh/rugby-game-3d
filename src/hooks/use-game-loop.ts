import { useFrame } from '@react-three/fiber'
import { DIFFICULTIES } from '@/constants/difficulty'
import { useKeyboardInput } from '@/hooks/use-keyboard-input'
import { checkAmmoGameOver, checkWin } from '@/systems/check-win'
import { tickSoldierDeathTimers } from '@/systems/soldier-death'
import { checkExplosion, createPigSplatFx, updateParticles, updatePigParts, updateSmoke } from '@/systems/check-explosion'
import { getActiveCurve } from '@/systems/setup-level'
import { dropMunition, updateMunitions } from '@/systems/update-munitions'
import { computeWind, updateDrone } from '@/systems/update-drone'
import { updateSoldiers } from '@/systems/update-soldiers'
import { filterBullets, updateBullets, updateEnemyDrones } from '@/systems/update-enemy-drones'
import { dist3 } from '@/utils/math'
import { useGameStore } from '@/stores/use-game-store'
import type { GameState } from '@/types/game'

export function useGameLoop() {
  const { readInput } = useKeyboardInput()

  useFrame(() => {
    const state = useGameStore.getState()
    if (state.gameState !== 'playing' || !state.drone || !state.levelData) return

    const curve = getActiveCurve(state.level)
    const drone = { ...state.drone }
    const soldiers = state.soldiers.map((s) => ({ ...s, position: { ...s.position }, velocity: { ...s.velocity } }))
    const shelters = state.shelters.map((s) => ({ ...s, position: { ...s.position } }))
    const enemyDrones = state.enemyDrones.map((e) => ({ ...e, position: { ...e.position }, velocity: { ...e.velocity } }))
    const ewTowers = state.ewTowers.map((t) => ({ ...t, position: { ...t.position } }))
    let munitions = state.munitions.map((m) => ({ ...m, position: { ...m.position }, velocity: { ...m.velocity } }))
    let bullets = state.bullets.map((b) => ({ ...b, position: { ...b.position }, velocity: { ...b.velocity } }))
    let particles = [...state.particles]
    let smoke = [...state.smoke]
    let pigParts = [...state.pigParts]
    let score = state.score
    let shake = state.shake
    let frame = state.frame + 1
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

    const input = readInput({ inverted: inputInverted })

    if (state.dropQueued) {
      const dropped = dropMunition(drone)
      if (dropped) munitions.push(dropped)
    }

    updateDrone({
      drone,
      curve,
      input,
      wind: windResult.wind,
      levelData: state.levelData,
      ewActive,
      frame,
    })

    const muniResult = updateMunitions({ munitions, wind: windResult.wind, frame })
    smoke.push(...muniResult.smoke)

    for (const impact of muniResult.impacts) {
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

    for (const killed of soldierResult.ramKills) {
      const splat = createPigSplatFx(killed.position)
      shake = Math.max(shake, splat.shake)
      particles.push(...splat.particles)
      smoke.push(...splat.smoke)
      pigParts.push(...splat.pigParts)
    }

    const droneResult = updateEnemyDrones({
      enemyDrones,
      drone,
      difficulty: state.difficulty,
      ewActive,
      frame,
    })
    bullets.push(...droneResult.bullets)
    if (droneResult.droneDamage) drone.hp -= droneResult.droneDamage
    if (droneResult.droneHit) drone.hit = droneResult.droneHit
    particles.push(...droneResult.sparks)

    const bulletResult = updateBullets({ bullets, drone })
    if (bulletResult.droneDamage) drone.hp -= bulletResult.droneDamage
    if (bulletResult.droneHit) drone.hit = bulletResult.droneHit
    particles.push(...bulletResult.sparks)
    bullets = filterBullets(bullets)

    tickSoldierDeathTimers(soldiers)

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

    useGameStore.setState({
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
    })
  })
}
