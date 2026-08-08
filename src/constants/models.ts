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

export const PIG_TARGET_HEIGHT = 0.72

export const PIG_MODEL = {
  path: '/models/pig/pig.glb',
  targetHeight: PIG_TARGET_HEIGHT,
} as const

/** Clip names inside pig.glb (verified via gltf-transform inspect) */
export const PIG_CLIPS = {
  walk: { clip: 'Walking', loop: true },
  walkGun: { clip: 'Walk_Left_with_Gun', loop: true },
  run: { clip: 'Running', loop: true },
  aim: { clip: 'Archery_Aim_with_Lateral_Scan', loop: true },
  shoot: { clip: 'Archery_Shot_2', loop: false },
  deathAbdominal: { clip: 'Fall_Dead_from_Abdominal_Injury', loop: false },
  deathShot: { clip: 'Shot_in_the_Back_and_Fall', loop: false },
} as const satisfies Record<string, PigClipConfig>

export type PigAnimKey = keyof typeof PIG_CLIPS

export const PIG_DEATH_FRAMES = 140
export const PIG_SHOOT_FRAMES = 90

/**
 * Blender / example frame: forward −Y, up +Z. Rx(+π/2) → game forward −Z, up +Y.
 * Model is authored correctly in Blender — no yaw flip.
 */
export const DRONE_MODEL: ModelFitConfig = {
  path: '/models/drone/drone.glb',
  targetSize: 0.35,
  scale: 1,
  rotation: [Math.PI / 2, 0, 0],
  offset: [0, 0, 0],
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
