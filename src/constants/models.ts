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

export const PIG_TARGET_HEIGHT = 0.05

export const PIG_MODEL = {
  path: '/models/pig/pig.glb',
  targetHeight: PIG_TARGET_HEIGHT,
} as const

/** Clip names inside pig.glb (verified via gltf-transform inspect) */
export const PIG_CLIPS = {
  walk: { clip: 'Walking', loop: true },
  walkGun: { clip: 'Walking', loop: true },
  run: { clip: 'Running', loop: true },
  aim: { clip: 'Walking', loop: true },
  shoot: { clip: 'Walking', loop: true },
  deathAbdominal: { clip: 'Dead', loop: false },
  deathShot: { clip: 'Dead', loop: false },
} as const satisfies Record<string, PigClipConfig>

export type PigAnimKey = keyof typeof PIG_CLIPS

export const PIG_DEATH_FRAMES = 140
export const PIG_SHOOT_FRAMES = 90

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

/** Propeller mesh name pattern — GLTFLoader strips dots (mesh_11.001 → mesh_11001) */
export const DRONE_PROPELLER_NODE_PATTERN = /^mesh_(?:0|1|11|11001)$/

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
  targetSize: 0.22,
  attach: {
    position: [0.05, 0.38, 0.04],
    rotation: [0, Math.PI * 0.5, 0],
    scale: 1,
  },
}

export const ALL_MODEL_PATHS = [
  DRONE_MODEL.path,
  BALL_MODEL.path,
  WEAPON_AK.path,
  PIG_MODEL.path,
]
