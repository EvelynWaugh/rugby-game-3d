import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ModelErrorBoundary } from '@/components/models/model-error-boundary'
import { enableShadows } from '@/utils/model-fit'

interface AnimatedModelProps {
  path: string
  targetHeight: number
  loop?: boolean
  clipName?: string
  speed?: number
  rotation?: [number, number, number]
  fallback?: React.ReactNode
}

function AnimatedModelInner({
  path,
  targetHeight,
  loop = true,
  clipName,
  speed = 1,
  rotation = [0, 0, 0],
}: Omit<AnimatedModelProps, 'fallback'>) {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF(path)

  const { clone, scale, footOffset } = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Group
    enableShadows(cloned)
    const box = new THREE.Box3().setFromObject(cloned)
    const height = box.getSize(new THREE.Vector3()).y
    const fitScale = targetHeight / Math.max(height, 0.001)
    return { clone: cloned, scale: fitScale, footOffset: -box.min.y }
  }, [scene, targetHeight])

  const { actions, names } = useAnimations(animations, groupRef)

  useEffect(() => {
    if (!actions || names.length === 0) return

    const clip = clipName && actions[clipName] ? clipName : names[0]
    const action = clip ? actions[clip] : undefined
    if (!action) return

    Object.values(actions).forEach((a) => a?.stop())
    action.reset()
    action.setEffectiveTimeScale(speed)
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1)
    action.clampWhenFinished = !loop
    action.play()
  }, [actions, names, clipName, loop, path, speed])

  return (
    <group ref={groupRef} scale={scale} rotation={rotation}>
      <primitive object={clone} position={[0, footOffset, 0]} />
    </group>
  )
}

export function AnimatedModel(props: AnimatedModelProps) {
  const { fallback = null, ...inner } = props
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <AnimatedModelInner {...inner} />
      </Suspense>
    </ModelErrorBoundary>
  )
}
