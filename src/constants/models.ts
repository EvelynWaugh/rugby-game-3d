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

/** Raw shelter.glb bbox (Y-up). Fitted so the longest axis equals targetSize. */
const SHELTER_RAW = { x: 1.8987, y: 0.6774, z: 1.8333 }

export const SHELTER_MODEL: ModelFitConfig = {
  path: '/models/shelter/shelter.glb',
  targetSize: 10,
}

const SHELTER_FIT =
  SHELTER_MODEL.targetSize / Math.max(SHELTER_RAW.x, SHELTER_RAW.y, SHELTER_RAW.z)

export const SHELTER_WORLD = {
  w: SHELTER_RAW.x * SHELTER_FIT,
  h: SHELTER_RAW.y * SHELTER_FIT,
  d: SHELTER_RAW.z * SHELTER_FIT,
}

/** Fraction of half-extent rats may occupy so they stay inside the walls. */
export const SHELTER_INTERIOR_RATIO = 0.55

/** rat.glb Armature is cm-scaled (0.01), same as the pig. */
export const RAT_TARGET_HEIGHT = 0.5

export const RAT_MODEL = {
  path: '/models/rat/rat.glb',
  targetHeight: RAT_TARGET_HEIGHT,
} as const

export const RAT_CLIPS = {
  walk: { clip: 'Walking', loop: true },
  die: { clip: 'Fall_Dead_from_Abdominal_Injury', loop: false },
} as const satisfies Record<string, PigClipConfig>

export type RatAnimKey = keyof typeof RAT_CLIPS

export const ENV_MODELS = {
  greenTree: { path: '/models/trees/green-tree.glb', targetSize: 8.5 },
  fallenTree: { path: '/models/trees/fallen-tree.glb', targetSize: 5.5 },
  fallenTree2: { path: '/models/trees/fallen-tree-2.glb', targetSize: 4.5 },
  fallenTree3: { path: '/models/trees/fallen-tree-3.glb', targetSize: 6 },
  crate: { path: '/models/crate/crate.glb', targetSize: 1.35 },
  granit: { path: '/models/granit/granit.glb', targetSize: 2.1 },
  dirt: { path: '/models/dirt/dirt.glb', targetSize: 4.2 },
  wall: { path: '/models/damaged-wall/wall.glb', targetSize: 7 },
  terrain: { path: '/models/terrain/terrain.glb', targetSize: 16 },
} as const satisfies Record<string, ModelFitConfig>

export const ALL_MODEL_PATHS = [
  DRONE_MODEL.path,
  BALL_MODEL.path,
  WEAPON_AK.path,
  PIG_MODEL.path,
  SHELTER_MODEL.path,
  RAT_MODEL.path,
  ...Object.values(ENV_MODELS).map((m) => m.path),
]
