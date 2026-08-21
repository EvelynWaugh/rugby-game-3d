export const EXPLOSION_RADIUS = 8
export const EXPLOSION_RADIUS_RED = 11
export const RAM_DAMAGE = 3
/** Horizontal reach for FPV body contact (pig torso + drone). */
export const RAM_HORIZ = 1.7
/** Drone can hit from slightly above the pig's head. */
export const RAM_ALT_MARGIN = 0.75
export const DRONE_THRUST = 0.014
export const DRONE_ALTITUDE_THRUST = 0.008
export const DRONE_TURN_SPEED = 0.032
export const DRONE_YAW_ACCEL = 0.018
export const DRONE_YAW_DAMPING = 0.9
export const DRONE_YAW_MAX = 0.038
export const DRONE_BATTERY_DRAIN = 0.009
export const DRONE_MAX_SPEED = 0.18
/** Idle cruise after spawn — half of max so the drone flies without stick input */
export const DRONE_CRUISE_SPEED = DRONE_MAX_SPEED * 0.5
export const DRONE_MAX_VERTICAL_SPEED = 0.07
/** Propeller spin (rad/s) — idle hover vs full cruise */
export const DRONE_PROPELLER_SPIN_HOVER = 28
export const DRONE_PROPELLER_SPIN_CRUISE = 72
export const MUNITION_FALL_RATE = 0.018
export const MUNITION_FALL_RATE_BIG = 0.013
export const DRONE_ACC = 0.4
export const DRONE_FRICTION = 0.94
export const DRONE_VERTICAL_FRICTION = 0.9
/** Per-frame damping of sideways slip so thrust stays along the nose */
export const DRONE_LATERAL_DAMP = 0.82
export const DRONE_YAW_SPEED = 0.045
export const LANE_HALF = 25
/** Low enough to dive into pigs; high enough that props clear the ground */
export const MIN_ALTITUDE = 0.5
export const MAX_ALTITUDE = 40
export const PIG_WALK_SPEED = 0.032
export const RAT_WALK_SPEED = 0.014
export const PIG_RUN_SPEED = 0.068
export const PIG_CATCH_SPEED = 0.09
export const PIG_TURN_CHANCE = 0.01
export const CATCH_RANGE = 6.5
export const CATCH_ALTITUDE = 4.2
export const BULLET_HIT_RADIUS = 2
export const BULLET_BATTERY_DRAIN = 6
export const PIG_BULLET_SPEED = 0.55
export const PIG_FIRE_INTERVAL = 12
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
