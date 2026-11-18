import { AdditiveBlending, CanvasTexture, DoubleSide, SRGBColorSpace } from 'three'
import { makeBlastTexture } from '@/components/fx/blast-textures'
import { useGameStore } from '@/stores/use-game-store'

function makeFlashMap() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const pixels = ctx.createImageData(canvas.width, canvas.height)
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const u = x / canvas.width
      const center = 0.5 + 0.045 * Math.sin(u * 14) * u
      const width = (0.06 + 0.3 * Math.sin(Math.PI * u ** 0.56)) * (1 - u)
      const edge = Math.abs(y / canvas.height - center) / Math.max(0.002, width)
      const core = Math.max(0, 1 - edge)
      const heat = core * (1 - u)
      const i = (y * canvas.width + x) * 4
      pixels.data[i] = 255
      pixels.data[i + 1] = 132 + heat * 123
      pixels.data[i + 2] = 44 + heat * 211
      pixels.data[i + 3] = 255 * Math.min(1, core * 3) * (1 - u * u)
    }
  }
  ctx.putImageData(pixels, 0, 0)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

let maps: { flame: CanvasTexture; smoke: CanvasTexture } | undefined

// The attachment's local +Z points out of the barrel.
export function MuzzleFlash({ firedAt }: { firedAt?: number }) {
  const age = useGameStore(s => firedAt === undefined || s.gameState !== 'playing'
    ? 14 : Math.min(14, s.frame - firedAt))
  if (age < 0 || age >= 14) return null
  const textures = maps ??= { flame: makeFlashMap(), smoke: makeBlastTexture(false) }
  const heat = Math.max(0, 1 - age / 6)
  const length = 0.28 + heat * 0.27
  const haze = 0.12 + age * 0.022
  return (
    <group name="muzzle-flash">
      {heat > 0 && (
        <group scale={[0.17 * heat, 0.17 * heat, length]}>
          {[0, Math.PI / 2].map(roll => (
            <group key={roll} rotation={[0, 0, roll]}>
              <mesh rotation={[0, -Math.PI / 2, 0]} position={[0, 0, 0.5]}>
                <planeGeometry />
                <meshBasicMaterial map={textures.flame} side={DoubleSide} transparent depthWrite={false}
                  opacity={heat} blending={AdditiveBlending} toneMapped={false} />
              </mesh>
            </group>
          ))}
          <sprite scale={[1.3, 1.3, 1]} position={[0, 0, 0.05]}>
            <spriteMaterial map={textures.smoke} color="#fff2cb" transparent opacity={heat}
              blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </sprite>
        </group>
      )}
      <sprite position={[0, age * 0.009, 0.14 + age * 0.017]} scale={[haze, haze * 0.82, 1]}>
        <spriteMaterial map={textures.smoke} color="#a39b8c" rotation={(firedAt ?? 0) * 0.7}
          transparent depthWrite={false} opacity={0.3 * (1 - age / 14)} />
      </sprite>
    </group>
  )
}
