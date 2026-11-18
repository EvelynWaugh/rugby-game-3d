import { CanvasTexture, SRGBColorSpace } from 'three'

function lattice(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return value - Math.floor(value)
}

function noise(x: number, y: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const u = x - ix
  const v = y - iy
  const a = u * u * (3 - 2 * u)
  const b = v * v * (3 - 2 * v)
  const lower = lattice(ix, iy) * (1 - a) + lattice(ix + 1, iy) * a
  const upper = lattice(ix, iy + 1) * (1 - a) + lattice(ix + 1, iy + 1) * a
  return lower * (1 - b) + upper * b
}

export function makeBlastTexture(flame: boolean) {
  const canvas = document.createElement('canvas')
  const size = 128
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(size, size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size
      const v = (y + 0.5) / size
      const radius = 2 * Math.hypot(u - 0.5, v - 0.5)
      const billow = noise(u * 6 + 2, v * 6) * 0.55 + noise(u * 14, v * 14) * 0.3
        + noise(u * 37, v * 37) * 0.15
      const density = Math.max(0, (0.63 - radius + (billow - 0.4) * 0.85) * 3)
      const heat = Math.min(1, Math.max(0, density * 0.39 + billow - 0.26))
      const shade = 85 + billow * 134 - v * 38
      const i = (y * size + x) * 4
      image.data[i] = flame ? 171 + heat * 100 : shade
      image.data[i + 1] = flame ? 33 + heat * 207 : shade
      image.data[i + 2] = flame ? 7 + heat ** 3 * 174 : shade
      image.data[i + 3] = Math.min(1, density) * 255
    }
  }
  ctx.putImageData(image, 0, 0)
  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  return map
}
