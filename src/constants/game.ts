export const EXPLOSION_RADIUS = 8
export const EXPLOSION_RADIUS_RED = 11
export const RAM_DAMAGE = 3
export const RAM_RADIUS = 12
export const RAM_RADIUS_3D = 16
export const DRONE_THRUST = 0.55
export const DRONE_TURN_SPEED = 0.032
export const DRONE_YAW_ACCEL = 0.018
export const DRONE_YAW_DAMPING = 0.9
export const DRONE_YAW_MAX = 0.038
export const DRONE_BATTERY_DRAIN = 0.028
export const DRONE_MAX_SPEED = 1.15
export const MUNITION_FALL_RATE = 0.018
export const MUNITION_FALL_RATE_BIG = 0.013
export const DRONE_ACC = 0.4
export const DRONE_FRICTION = 0.92
export const DRONE_YAW_SPEED = 0.045
export const LANE_HALF = 25
export const MIN_ALTITUDE = 1.5
export const MAX_ALTITUDE = 40
export const BULLET_HIT_RADIUS = 2
export const SOLDIER_SHOOT_RANGE = 32
export const SOLDIER_SHOOT_RANGE_SQ = SOLDIER_SHOOT_RANGE * SOLDIER_SHOOT_RANGE
export const DRONE_DRONE_HIT_RADIUS = 2.4
export const SHELTER_EXPLOSION_DAMAGE = 40

export const SCORE = {
  pigExplosion: 200,
  pigRam: 300,
  redSoldier: 100,
  enemyDrone: 200,
  shelter: 300,
  commandShelter: 2000,
  ewTower: 400,
} as const

// Model paths live in src/constants/models.ts
