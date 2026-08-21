import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ModelErrorBoundary } from '@/components/models/model-error-boundary'
import { fitObjectToSize, enableShadows, groundObjectToFloor } from '@/utils/model-fit'

interface StaticModelProps {
  path: string
  targetSize: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  tint?: string
  ground?: boolean
  fallback?: React.ReactNode
}

function StaticModelInner({
  path,
  targetSize,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  tint,
  ground = false,
}: Omit<StaticModelProps, 'fallback'>) {
  const { scene } = useGLTF(path)

  const model = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Group
    enableShadows(cloned)
    fitObjectToSize(cloned, targetSize)
    if (ground) groundObjectToFloor(cloned)
    if (tint) {
      const c = new THREE.Color(tint)
      cloned.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return
        const mesh = child as THREE.Mesh
        const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        const tinted = source.map((mat) => {
          const m = (mat as THREE.MeshStandardMaterial).clone()
          if (m.color) m.color.lerp(c, 0.28)
          return m
        })
        mesh.material = Array.isArray(mesh.material) ? tinted : tinted[0]
      })
    }
    return cloned
  }, [scene, targetSize, tint, ground])

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={model} />
    </group>
  )
}

export function StaticModel(props: StaticModelProps) {
  const { fallback = null, ...inner } = props
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <StaticModelInner {...inner} />
      </Suspense>
    </ModelErrorBoundary>
  )
}
