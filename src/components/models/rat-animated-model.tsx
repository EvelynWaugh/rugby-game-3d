import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Object3D } from 'three'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ModelErrorBoundary } from '@/components/models/model-error-boundary'
import { RAT_CLIPS, RAT_MODEL, type RatAnimKey } from '@/constants/models'
import { enableShadows, fitSkinnedToHeight, fixSkinnedMaterials } from '@/utils/model-fit'

useGLTF.preload(RAT_MODEL.path)

interface RatAnimatedModelProps {
  animKey: RatAnimKey
  speed?: number
  fallback?: React.ReactNode
}

function RatAnimatedModelInner({
  animKey,
  speed = 1,
}: Omit<RatAnimatedModelProps, 'fallback'>) {
  const cloneRef = useRef<Object3D>(null)
  const activeRef = useRef<THREE.AnimationAction | null>(null)
  const { scene, animations } = useGLTF(RAT_MODEL.path)

  const { clone, fit } = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Group
    enableShadows(cloned)
    fixSkinnedMaterials(cloned)
    return {
      clone: cloned,
      fit: fitSkinnedToHeight(cloned, RAT_MODEL.targetHeight),
    }
  }, [scene])

  const { actions, names } = useAnimations(animations, cloneRef)
  const { clip, loop } = RAT_CLIPS[animKey]

  useLayoutEffect(() => {
    if (!actions || names.length === 0) return

    const action = actions[clip] ?? actions.Walking
    if (!action) return

    const prev = activeRef.current
    if (prev && prev !== action) prev.fadeOut(0.16)

    action.reset()
    action.setEffectiveWeight(1)
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1)
    action.clampWhenFinished = !loop
    action.paused = false
    action.setEffectiveTimeScale(speed)
    action.fadeIn(prev ? 0.16 : 0).play()

    activeRef.current = action
  }, [actions, names, animKey, clip, loop, speed])

  return (
    <group scale={fit.scale}>
      <primitive ref={cloneRef} object={clone} position={fit.position} />
    </group>
  )
}

export function RatAnimatedModel(props: RatAnimatedModelProps) {
  const { fallback = null, ...inner } = props
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <RatAnimatedModelInner {...inner} />
      </Suspense>
    </ModelErrorBoundary>
  )
}
