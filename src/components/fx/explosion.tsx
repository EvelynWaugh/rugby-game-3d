import { LightStreak } from '@/components/fx/light-streak'
import type { Particle } from '@/types/game'

export function Particles({ particles }: { particles: Particle[] }) {
  return particles.map(spark => {
    const fade = spark.life / spark.max
    return (
      <LightStreak key={spark.id} position={spark.position} velocity={spark.velocity} color={spark.color}
        length={spark.r * (0.8 + fade)} width={spark.r * 0.075} opacity={fade} />
    )
  })
}
