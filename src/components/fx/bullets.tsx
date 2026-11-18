import { LightStreak } from '@/components/fx/light-streak'
import type { Bullet } from '@/types/game'

export function Bullets({ bullets }: { bullets: Bullet[] }) {
  return bullets.map(bullet => (
    <LightStreak key={bullet.id} position={bullet.position} velocity={bullet.velocity}
      length={1.05} width={0.023} color={bullet.enemy ? '#fff2d2' : '#bdefff'} />
  ))
}
