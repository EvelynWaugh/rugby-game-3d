import { Suspense, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { Group } from 'three'
import { ModelErrorBoundary } from '@/components/models/model-error-boundary'

interface GltfModelProps {
  path: string
  scale?: number
  rotationY?: number
  offsetY?: number
  targetSize?: number
  fallback: React.ReactNode
}

function GltfModelInner({
  path,
  scale = 1,
  rotationY = 0,
  offsetY = 0,
  targetSize = 2.5,
}: Omit<GltfModelProps, 'fallback'>) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF(path)

  const model = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Group
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })

    const box = new THREE.Box3().setFromObject(cloned)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z, 0.001)
    const fitScale = targetSize / maxDim
    cloned.scale.setScalar(fitScale)

    const fittedBox = new THREE.Box3().setFromObject(cloned)
    const center = fittedBox.getCenter(new THREE.Vector3())
    cloned.position.sub(center)
    return cloned
  }, [scene, targetSize])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.y = offsetY
  })

  return (
    <group ref={groupRef} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={model} />
    </group>
  )
}

export function GltfModel(props: GltfModelProps) {
  const { fallback, ...inner } = props
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GltfModelInner {...inner} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

export function preloadModel(path: string) {
  useGLTF.preload(path)
}
