import type { DifficultyConfig, DifficultyKey } from '@/types/game'

export const DIFFICULTIES: Record<DifficultyKey, DifficultyConfig> = {
  low: { name: 'LOW', battery: 17.5, wind: 0.5, ewInvert: false, ewDelay: 0, enemyRate: 2.6, enemySpeed: 0.7 },
  medium: { name: 'MEDIUM', battery: 10.0, wind: 1.0, ewInvert: true, ewDelay: 1, enemyRate: 1.0, enemySpeed: 1.0 },
  high: { name: 'HIGH', battery: 7.75, wind: 1.8, ewInvert: true, ewDelay: 2, enemyRate: 0.55, enemySpeed: 1.5 },
}

export const DIFFICULTY_KEYS: DifficultyKey[] = ['low', 'medium', 'high']
