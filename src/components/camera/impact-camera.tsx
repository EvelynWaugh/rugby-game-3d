import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Vector4 } from 'three'
import { useGameStore } from '@/stores/use-game-store'
import type { ImpactView } from '@/types/game'

const WIDTH_FRACTION = 0.32
const MAX_WIDTH = 310
const ASPECT = 1.65
const INSET = 16
const TOP = 82

export function ImpactCameraFrame() {
  const active = useGameStore(s => Boolean(s.impactView))
  if (!active) return null
  return (
    <div aria-label="Impact camera" className="impact-camera-frame" style={{
      width: `min(${WIDTH_FRACTION * 100}%, ${MAX_WIDTH}px)`,
      aspectRatio: ASPECT, right: INSET, top: TOP,
    }}>
      <span className="mono">IMPACT CAM</span>
    </div>
  )
}

export function ImpactCamera({ view }: { view: ImpactView }) {
  const inset = useMemo(() => new PerspectiveCamera(41, ASPECT, 0.08, 220), [])
  const viewport = useMemo(() => new Vector4(), [])
  const scissor = useMemo(() => new Vector4(), [])
  useFrame(({ gl, scene, camera, size }) => {
    // A positive priority owns rendering only while the second view is mounted.
    gl.render(scene, camera)
    const { soldiers, frame } = useGameStore.getState()
    const target = soldiers.find(s => s.id === view.soldierId)
    if (!target) return

    const { x, y, z } = target.position
    const bearing = view.yaw + 1.05
    const distance = target.patrol ? 6.5 : 4.5
    inset.position.set(x + Math.sin(bearing) * distance, y + 2.65, z - Math.cos(bearing) * distance)
    const remaining = Math.min(1, Math.max(0, (view.untilFrame - frame) / 180))
    inset.lookAt(x, y + 0.25 + remaining * 0.48, z)

    const width = Math.round(Math.min(MAX_WIDTH, size.width * WIDTH_FRACTION))
    const height = Math.round(width / ASPECT)
    const left = size.width - width - INSET
    const bottom = size.height - height - TOP
    gl.getViewport(viewport)
    gl.getScissor(scissor)
    const previousTest = gl.getScissorTest()
    const updateShadows = gl.shadowMap.autoUpdate
    try {
      gl.shadowMap.autoUpdate = false
      gl.setScissorTest(true)
      gl.setViewport(left, bottom, width, height)
      gl.setScissor(left, bottom, width, height)
      gl.render(scene, inset)
    } finally {
      gl.setViewport(viewport)
      gl.setScissor(scissor)
      gl.setScissorTest(previousTest)
      gl.shadowMap.autoUpdate = updateShadows
    }
  }, 1)
  return null
}
