import * as THREE from 'three'

/** Tileable, seeded surface grain. Generated once when a sector mounts. */
export function makeSurfaceTexture(road: boolean, urban = false) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = road ? (urban ? '#858380' : '#b7a98a') : '#e2e0cf'
  ctx.fillRect(0, 0, 256, 256)
  let seed = 1259
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  for (let i = 0; i < 7400; i++) {
    const x = random() * 256
    const y = random() * 256
    ctx.fillStyle = random() < 0.55 ? 'rgba(65,58,41,0.19)' : 'rgba(255,250,219,0.22)'
    ctx.fillRect(x, y, random() * 2 + 0.6, random() * (road ? 2 : 5) + 0.6)
  }
  if (road) {
    for (const x of [8, 77, 178, 247]) {
      const rut = ctx.createLinearGradient(x - 8, 0, x + 8, 0)
      rut.addColorStop(0, 'transparent')
      rut.addColorStop(0.5, 'rgba(71,63,48,0.20)')
      rut.addColorStop(1, 'transparent')
      ctx.fillStyle = rut
      ctx.fillRect(x - 8, 0, 16, 256)
    }
    if (urban) {
      ctx.fillStyle = '#cfbc86'
      ctx.fillRect(126, 30, 4, 92)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  if (!road) texture.repeat.set(86, 142)
  return texture
}
