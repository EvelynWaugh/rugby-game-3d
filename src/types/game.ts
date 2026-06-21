export type GameState = 'start' | 'difficulty' | 'playing' | 'levelclear' | 'gameover' | 'victory'

export type DifficultyKey = 'low' | 'medium' | 'high'

export type WinType =
  | 'targets'
  | 'shelters85'
  | 'dronesbunkers'
  | 'ewtargets'
  | 'command'
  | 'devilmouth'

export interface DifficultyConfig {
  name: string
  battery: number
  wind: number
  ewInvert: boolean
  ewDelay: number
  enemyRate: number
  enemySpeed: number
}

export interface LevelConfig {
  name: string
  env: string
  muni: number
  wind: boolean
  drones: number
  ew: number
  soldiers: number
  reds: number
  shelters: number
  win: WinType
  brief: string
  clear: string
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface Drone {
  position: Vec3
  velocity: Vec3
  hp: number
  maxhp: number
  munitions: number
  hasBigBall: boolean
  hit: number
  pathT: number
  lateral: number
  altitude: number
  lateralVel: number
  altitudeVel: number
  yaw: number
  yawVel: number
  grounded: number
}

export type PigBehavior = 'biped' | 'flee' | 'aim' | 'shoot'
export type DeathVariant = 'abdominal' | 'shot'

export interface Soldier {
  id: string
  position: Vec3
  spawnPosition: Vec3
  velocity: Vec3
  hp: number
  maxhp: number
  cool: number
  dead: boolean
  pig: boolean
  immune: boolean
  visible: boolean
  behavior: PigBehavior
  cowardly: boolean
  weaponDropped: boolean
  shootTimer: number
  jamOff: number
  deathTimer: number
  deathVariant: DeathVariant
}

export interface Rat {
  ox: number
  oy: number
  dead: boolean
  phase: number
}

export interface Shelter {
  id: string
  position: Vec3
  hp: number
  maxhp: number
  w: number
  h: number
  dead: boolean
  command: boolean
  rats: Rat[]
}

export interface EnemyDrone {
  id: string
  position: Vec3
  velocity: Vec3
  hp: number
  cool: number
  dead: boolean
  immune: boolean
  visible: boolean
  jamOff: number
}

export interface EwTower {
  id: string
  position: Vec3
  r: number
  hp: number
  maxhp: number
  dead: boolean
  immune: boolean
}

export interface Munition {
  id: string
  position: Vec3
  velocity: Vec3
  alt: number
  groundX: number
  groundZ: number
  dropHeight: number
  rot: number
  spin: number
  isBigBall: boolean
  done: boolean
}

export interface Bullet {
  id: string
  position: Vec3
  velocity: Vec3
  life: number
  enemy: boolean
}

export interface Particle {
  id: string
  position: Vec3
  velocity: Vec3
  life: number
  max: number
  color: string
  r: number
}

export interface Smoke {
  id: string
  position: Vec3
  velocity: Vec3
  life: number
  max: number
  r: number
}

export interface PigPart {
  id: string
  position: Vec3
  velocity: Vec3
  rot: number
  spin: number
  life: number
  max: number
  type: 'body' | 'head'
}

export interface Wind {
  x: number
  z: number
}

export interface InputState {
  forward: number
  lateral: number
  altitude: number
  yaw: number
  drop: boolean
}
