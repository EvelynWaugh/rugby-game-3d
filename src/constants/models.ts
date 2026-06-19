/** Central registry for all 3D assets — paths, scale, animation, attach offsets */

export interface ModelFitConfig {
  path: string
  targetSize: number
  scale?: number
  rotation?: [number, number, number]
  offset?: [number, number, number]
}

export interface PigAnimConfig extends ModelFitConfig {
  loop: boolean
}

export const DRONE_MODEL: ModelFitConfig = {
  path: '/models/drone/drone.glb',
  targetSize: 0.55,
  scale: 1,
  rotation: [0, 0, 0],
  offset: [0, 0, 0],
}

export const BALL_MODEL: ModelFitConfig = {
  path: '/models/ball/ball.glb',
  targetSize: 0.42,
  scale: 1,
  rotation: [0, 0, 0],
}

export const WEAPON_AK: ModelFitConfig & {
  attach: { position: [number, number, number]; rotation: [number, number, number]; scale: number }
} = {
  path: '/models/weapon/ak/ak.glb',
  targetSize: 0.9,
  attach: {
    position: [0.28, 0.72, 0.18],
    rotation: [0, Math.PI * 0.5, 0],
    scale: 1,
  },
}

export const PIG_ANIMS = {
  walk: {
    path: '/models/pig/PIg_Animation_Walking_withSkin.glb',
    targetSize: 1.6,
    loop: true,
  },
  walkGun: {
    path: '/models/pig/Pig_Animation_Walk_Left_with_Gun_withSkin.glb',
    targetSize: 1.6,
    loop: true,
  },
  run: {
    path: '/models/pig/PIg_Animation_Running_withSkin.glb',
    targetSize: 1.6,
    loop: true,
  },
  aim: {
    path: '/models/pig/Pig_Animation_Archery_Aim_with_Lateral_Scan_withSkin.glb',
    targetSize: 1.6,
    loop: true,
  },
  shoot: {
    path: '/models/pig/Pig_Animation_Archery_Shot_2_withSkin.glb',
    targetSize: 1.6,
    loop: false,
  },
  deathAbdominal: {
    path: '/models/pig/Pig_Animation_Fall_Dead_from_Abdominal_Injury_withSkin.glb',
    targetSize: 1.6,
    loop: false,
  },
  deathShot: {
    path: '/models/pig/PIg_Animation_Shot_in_the_Back_and_Fall_withSkin.glb',
    targetSize: 1.6,
    loop: false,
  },
} as const satisfies Record<string, PigAnimConfig>

export type PigAnimKey = keyof typeof PIG_ANIMS

export const PIG_DEATH_FRAMES = 140

export const ALL_MODEL_PATHS = [
  DRONE_MODEL.path,
  BALL_MODEL.path,
  WEAPON_AK.path,
  ...Object.values(PIG_ANIMS).map((a) => a.path),
]
