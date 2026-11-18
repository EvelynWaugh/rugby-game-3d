import { MuzzleFlash } from '@/components/fx/muzzle-flash'
import { WEAPON_AK } from '@/constants/models'
import { StaticModel } from '@/components/models/static-model'

export function WeaponAk({ visible = true, firedAt }: { visible?: boolean; firedAt?: number }) {
  if (!visible) return null

  const { attach } = WEAPON_AK
  return (
    <group position={attach.position} rotation={attach.rotation} scale={attach.scale}>
      <StaticModel path={WEAPON_AK.path} targetSize={WEAPON_AK.targetSize} />
      <group position={WEAPON_AK.muzzle} rotation={[0, -Math.PI / 2, 0]}>
        <MuzzleFlash firedAt={firedAt} />
      </group>
    </group>
  )
}
