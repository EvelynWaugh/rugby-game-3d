import type { Drone, EnemyDrone, EwTower, LevelConfig, Munition, Shelter, Soldier } from '@/types/game'

export type WinCheckResult = 'playing' | 'levelclear' | 'victory' | 'gameover'

export function checkWin({
  levelData,
  level,
  soldiers,
  shelters,
  enemyDrones,
  ewTowers,
  devilDefeated,
}: {
  levelData: LevelConfig
  level: number
  soldiers: Soldier[]
  shelters: Shelter[]
  enemyDrones: EnemyDrone[]
  ewTowers: EwTower[]
  devilDefeated: boolean
}): WinCheckResult {
  let won = false
  const sActive = soldiers.filter((s) => !s.dead).length
  const shActive = shelters.filter((s) => !s.dead).length
  const eActive = enemyDrones.filter((e) => !e.dead).length
  const tActive = ewTowers.filter((t) => !t.dead).length

  switch (levelData.win) {
    case 'targets':
      won = sActive === 0 && shActive === 0
      break
    case 'shelters85':
      won = sActive === 0 && shActive <= Math.floor(levelData.shelters * 0.15)
      break
    case 'dronesbunkers':
      won = eActive === 0 && shActive === 0 && sActive === 0
      break
    case 'ewtargets':
      won = tActive === 0 && sActive === 0 && shActive === 0
      break
    case 'command': {
      const cmd = shelters.find((s) => s.command)
      won = Boolean(cmd && cmd.dead)
      break
    }
    case 'devilmouth':
      won = devilDefeated
      break
  }

  if (won) return level >= 5 ? 'victory' : 'levelclear'
  return 'playing'
}

export function checkAmmoGameOver({
  levelData,
  drone,
  munitions,
  won,
  shelters,
}: {
  levelData: LevelConfig
  drone: Drone
  munitions: Munition[]
  won: boolean
  shelters: Shelter[]
}): boolean {
  if (levelData.win === 'devilmouth') return false
  if (drone.munitions > 0 || munitions.length > 0 || won) return false

  if (levelData.win === 'command') {
    const cmd = shelters.find((s) => s.command)
    if (cmd && !cmd.dead) return true
    return false
  }

  return true
}
