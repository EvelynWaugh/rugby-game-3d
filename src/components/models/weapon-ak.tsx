import { WEAPON_AK } from '@/constants/models'
import { StaticModel } from '@/components/models/static-model'

export function WeaponAk({ visible = true }: { visible?: boolean }) {
  if (!visible) return null

  const { attach } = WEAPON_AK
  return (
    <StaticModel
      path={WEAPON_AK.path}
      targetSize={WEAPON_AK.targetSize}
      position={attach.position}
      rotation={attach.rotation}
      scale={attach.scale}
    />
  )
}
