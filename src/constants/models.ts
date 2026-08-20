/** Central registry for all 3D assets — paths, scale, animation, attach offsets */

export interface ModelFitConfig {
  path: string
  targetSize: number
  scale?: number
  rotation?: [number, number, number]
  offset?: [number, number, number]
}

export interface PigClipConfig {
  clip: string
  loop: boolean
}

/** World-space height in meters. pig.glb Armature is scaled 0.01 (cm); fit must use world bbox. */
export const PIG_TARGET_HEIGHT = 1.65

export const PIG_MODEL = {
  path: '/models/pig/pig.glb',
  targetHeight: PIG_TARGET_HEIGHT,
} as const

/**
 * Clip names inside pig.glb (GLTFLoader).
 * Locomotion clips are in-place — world travel is applied in update-soldiers.ts.
 */
export const PIG_CLIPS = {
  walk: { clip: 'Walking', loop: true },
  walkGun: { clip: 'Walking', loop: true },
  run: { clip: 'Running', loop: true },
  aim: { clip: 'Walk_Backward_While_Shooting', loop: true },
  shoot: { clip: 'Walk_Backward_While_Shooting', loop: true },
  catch: { clip: 'Leap_Right_and_Catch', loop: false },
  deathAbdominal: { clip: 'Dead', loop: false },
  deathShot: { clip: 'Dead', loop: false },
} as const satisfies Record<string, PigClipConfig>

export type PigAnimKey = keyof typeof PIG_CLIPS

/** Dead clip is ~2.96s — keep the corpse visible until it finishes */
export const PIG_DEATH_FRAMES = 180
export const PIG_SHOOT_FRAMES = 114
export const PIG_CATCH_FRAMES = 162

/**
 * Blender glTF: forward −Y, up +Z. Ry(π) aligns authored nose with game forward (−Z) after Y-up remap.
 * Visual yaw is applied in drone.tsx (rotation.y = −drone.yaw) — do not add a yaw flip here.
 */
export const DRONE_MODEL: ModelFitConfig = {
  path: '/models/drone/drone.glb',
  targetSize: 0.42,
  scale: 1,
  rotation: [0, Math.PI, 0],
  /** Nudge toward chase cam so rear fuselage + rugby rack stay in the lower FOV */
  offset: [0, 0.04, -0.12],
}

/** Propeller nodes in drone.glb — Meshy quad props, plus legacy names (not Mesh_0, which is the body). */
export function isDronePropellerNode(name: string) {
  if (/meshy_meshy_model_mesh_node/i.test(name)) return true
  if (/(?:^|_|-)(?:prop|rotor|blade)/i.test(name)) return true
  if (/^mesh_(?:1|11|11001)$/.test(name)) return true
  return false
}

export const BALL_MODEL: ModelFitConfig = {
  path: '/models/ball/ball.glb',
  targetSize: 0.38,
  scale: 1,
  rotation: [0, 0, 0],
}

export const WEAPON_AK: ModelFitConfig & {
  attach: { position: [number, number, number]; rotation: [number, number, number]; scale: number }
} = {
  path: '/models/weapon/ak/ak.glb',
  targetSize: 0.48,
  attach: {
    position: [0.02, 0.1, 0.05],
    rotation: [Math.PI * 0.5, Math.PI, 0],
    scale: 1,
  },
}

export const ALL_MODEL_PATHS = [
  DRONE_MODEL.path,
  BALL_MODEL.path,
  WEAPON_AK.path,
  PIG_MODEL.path,
]
