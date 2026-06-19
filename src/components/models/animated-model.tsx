import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ModelErrorBoundary } from '@/components/models/model-error-boundary'
import { fitObjectToSize, enableShadows } from '@/utils/model-fit'

interface AnimatedModelProps {
  path: string
  targetSize: number
  loop?: boolean
  clipName?: string
  speed?: number
  rotation?: [number, number, number]
  scale?: number
  onFinished?: () => void
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
  onFinished,
}: Omit<AnimatedModelProps, 'fallback'>) {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF(path)

  const model = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Group
    enableShadows(cloned)
    fitObjectToSize(cloned, targetSize)
    return cloned
  }, [scene, targetSize])

  const { actions, mixer } = useAnimations(animations, groupRef)

  useEffect(() => {
    if (!actions || animations.length === 0) return

    const name = clipName ?? animations[0]?.name
    const action = name ? actions[name] : Object.values(actions)[0]
    if (!action) return

    action.reset()
    action.setEffectiveTimeScale(speed)
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1)
    action.clampWhenFinished = !loop
    action.fadeIn(0.15).play()

    return () => {
      action.fadeOut(0.1)
    }
  }, [actions, animations, clipName, loop, path, speed])

  useEffect(() => {
    if (!mixer || loop || !onFinished) return

    function onFinishedEvent(e: { action?: THREE.AnimationAction }) {
      if (e.action?.clampWhenFinished) onFinished?.()
    }

    mixer.addEventListener('finished', onFinishedEvent)
    return () => mixer.removeEventListener('finished', onFinishedEvent)
  }, [mixer, loop, onFinished])

  return (
    <group ref={groupRef} rotation={rotation} scale={scale}>
      <primitive object={model} />
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
