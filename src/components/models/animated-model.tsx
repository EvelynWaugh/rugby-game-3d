import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ModelErrorBoundary } from '@/components/models/model-error-boundary'
import { fitObjectToSize, enableShadows, groundObjectToFloor } from '@/utils/model-fit'

interface AnimatedModelProps {
  path: string
  targetSize: number
  loop?: boolean
  clipName?: string
  speed?: number
  rotation?: [number, number, number]
  scale?: number
  fallback?: React.ReactNode
}

function AnimatedModelInner({
  path,
  targetSize,
  loop = true,
  clipName,
  speed = 1,
  rotation = [0, 0, 0],
  scale = 1,
}: Omit<AnimatedModelProps, 'fallback'>) {
  const modelRef = useRef<Group>(null)
  const { scene, animations } = useGLTF(path)

  const model = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Group
    enableShadows(cloned)
    fitObjectToSize(cloned, targetSize)
    groundObjectToFloor(cloned)
    cloned.rotation.set(rotation[0], rotation[1], rotation[2])
    cloned.scale.multiplyScalar(scale)
    return cloned
  }, [scene, targetSize, rotation, scale])

  const { actions, names } = useAnimations(animations, modelRef)

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

  return <primitive ref={modelRef} object={model} />
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
