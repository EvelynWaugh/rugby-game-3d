import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { MAP } from '@/constants/game'

import { makeSurfaceTexture } from './surface-texture'

export const SECTOR_COLORS = [
  { field: '#89925c', soil: '#797048', haze: '#d4d7bd', sun: '#ffdfae' },
  { field: '#a89e69', soil: '#877449', haze: '#ded5bd', sun: '#ffddaa' },
  { field: '#737e73', soil: '#65615b', haze: '#acbdc4', sun: '#e2edff' },
  { field: '#807358', soil: '#514e48', haze: '#c5aaa0', sun: '#ffc697' },
]

export function Ground({ level }: { level: number }) {
  const texture = useMemo(() => makeSurfaceTexture(false), [])
  useEffect(() => () => texture.dispose(), [texture])
  const geometry = useMemo(() => {
    const width = MAP.maxX - MAP.minX
    const depth = MAP.maxZ - MAP.minZ
    // The outer ring rises into a distant ridge beyond the level boundary.
    const geo = new THREE.PlaneGeometry(width + 360, depth + 360, 112, 192)
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, -0.02, (MAP.maxZ + MAP.minZ) / 2)
    const points = geo.getAttribute('position')
    const colors = new Float32Array(points.count * 3)
    const palette = SECTOR_COLORS[level - 1]
    const field = new THREE.Color(palette.field)
    const soil = new THREE.Color(palette.soil)
    const color = new THREE.Color()
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i)
      const z = points.getZ(i)
      const outside = Math.max(0, MAP.minX - x, x - MAP.maxX, MAP.minZ - z, z - MAP.maxZ)
      const ridge = 0.18 + 0.08 * Math.sin(z * 0.045 + level) + 0.06 * Math.cos(x * 0.06)
      points.setY(i, -0.02 + outside * ridge)
      const parcel = Math.sin(x * 0.054 + Math.sin(z * 0.043)) * Math.cos(z * 0.083)
      const furrow = Math.cos(x * 0.5 + z * 0.08)
      color.copy(field).lerp(soil, 0.5 + parcel * 0.42).multiplyScalar(0.94 + furrow * 0.06)
      color.toArray(colors, i * 3)
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [level])
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial map={texture} vertexColors roughness={1} />
    </mesh>
  )
}
