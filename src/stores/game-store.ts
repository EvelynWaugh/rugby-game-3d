import { LEVELS } from '@/constants/levels'
import { getLevelPath } from '@/systems/path-system'
import type { DifficultyKey, Drone, GameState, LevelConfig } from '@/types/game'
import type {
  Bullet,
  EnemyDrone,
  EwTower,
  Munition,
  Particle,
  PigPart,
  Shelter,
  Smoke,
  Soldier,
  Wind,
} from '@/types/game'
import { makeDrone, spawnEntitiesForLevel } from '@/systems/setup-level'

export interface GameStoreState {
  gameState: GameState
  difficulty: DifficultyKey
  diffSel: number
  startSel: number
  bossRoundOnly: boolean
  level: number
  score: number
  frame: number
  shake: number
  levelData: LevelConfig | null
  drone: Drone | null
  soldiers: Soldier[]
  shelters: Shelter[]
  enemyDrones: EnemyDrone[]
  ewTowers: EwTower[]
  munitions: Munition[]
  bullets: Bullet[]
  particles: Particle[]
  smoke: Smoke[]
  pigParts: PigPart[]
  wind: Wind
  windPhase: number
  ewActive: boolean
  inputInverted: boolean
  inputDelay: number
  levelMessage: string
  dropQueued: boolean
  resetGame: () => void
  setGameState: (state: GameState) => void
  setDifficulty: (difficulty: DifficultyKey) => void
  setDiffSel: (sel: number) => void
  setStartSel: (sel: number) => void
  setBossRoundOnly: (value: boolean) => void
  startGame: () => void
  startBossGame: () => void
  nextLevel: () => void
  setupLevel: (level: number) => void
  queueDrop: () => void
  patch: (partial: Partial<GameStoreState>) => void
}

const initialMenuState = {
  gameState: 'start' as GameState,
  difficulty: 'medium' as DifficultyKey,
  diffSel: 1,
  startSel: 0,
  bossRoundOnly: false,
  level: 1,
  score: 0,
  frame: 0,
  shake: 0,
  levelData: null as LevelConfig | null,
  drone: null as Drone | null,
  soldiers: [] as Soldier[],
  shelters: [] as Shelter[],
  enemyDrones: [] as EnemyDrone[],
  ewTowers: [] as EwTower[],
  munitions: [] as Munition[],
  bullets: [] as Bullet[],
  particles: [] as Particle[],
  smoke: [] as Smoke[],
  pigParts: [] as PigPart[],
  wind: { x: 0, z: 0 },
  windPhase: 0,
  ewActive: false,
  inputInverted: false,
  inputDelay: 0,
  levelMessage: '',
  dropQueued: false,
}

export function createGameStore(set: (fn: (state: GameStoreState) => Partial<GameStoreState>) => void, get: () => GameStoreState): GameStoreState {
  return {
    ...initialMenuState,

    resetGame() {
      set(() => ({ ...initialMenuState }))
    },

    setGameState(gameState) {
      set(() => ({ gameState }))
    },

    setDifficulty(difficulty) {
      set(() => ({ difficulty }))
    },

    setDiffSel(diffSel) {
      set(() => ({ diffSel }))
    },

    setStartSel(startSel) {
      set(() => ({ startSel }))
    },

    setBossRoundOnly(bossRoundOnly) {
      set(() => ({ bossRoundOnly }))
    },

    setupLevel(level) {
      const levelData = LEVELS[level]
      if (!levelData) return

      const difficulty = get().difficulty
      const curve = getLevelPath(level)
      const drone = makeDrone(difficulty, curve, levelData.muni, level === 5)
      const entities = spawnEntitiesForLevel({ level, levelData, difficulty, curve })

      set(() => ({
        level,
        levelData,
        drone,
        soldiers: entities.soldiers,
        shelters: entities.shelters,
        enemyDrones: entities.enemyDrones,
        ewTowers: entities.ewTowers,
        munitions: [],
        bullets: [],
        particles: [],
        smoke: [],
        pigParts: [],
        wind: { x: 0, z: 0 },
        windPhase: 0,
        ewActive: false,
        frame: 0,
        shake: 0,
        dropQueued: false,
        levelMessage: levelData.brief,
      }))
    },

    startGame() {
      const state = get()
      state.setupLevel(1)
      set(() => ({ gameState: 'playing', score: 0, bossRoundOnly: false }))
    },

    startBossGame() {
      const state = get()
      state.setupLevel(5)
      set(() => ({ gameState: 'playing', score: 0 }))
    },

    nextLevel() {
      const state = get()
      const next = state.level + 1
      if (next > 5) {
        set(() => ({ gameState: 'victory' }))
        return
      }
      state.setupLevel(next)
      set(() => ({ gameState: 'playing' }))
    },

    queueDrop() {
      set(() => ({ dropQueued: true }))
    },

    patch(partial) {
      set(() => partial)
    },
  }
}
