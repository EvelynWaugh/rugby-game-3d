import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ModelErrorBoundary } from '@/components/models/model-error-boundary'
import { PIG_CLIPS, PIG_MODEL, type PigAnimKey } from '@/constants/models'
import { enableShadows, fitSkinnedToHeight, fixSkinnedMaterials } from '@/utils/model-fit'

useGLTF.preload(PIG_MODEL.path)

interface PigAnimatedModelProps {
  animKey: PigAnimKey
  speed?: number
  rotation?: [number, number, number]
  fallback?: React.ReactNode
}

function PigAnimatedModelInner({
  animKey,
  speed = 1,
  rotation = [0, 0, 0],
}: Omit<PigAnimatedModelProps, 'fallback'>) {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF(PIG_MODEL.path)

  const { clone, fit } = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Group
    enableShadows(cloned)
    fixSkinnedMaterials(cloned)
    return {
      clone: cloned,
      fit: fitSkinnedToHeight(cloned, PIG_MODEL.targetHeight),
    }
  }, [scene])

  const { actions, names } = useAnimations(animations, groupRef)
  console.log(actions, names)
  const { clip, loop } = PIG_CLIPS[animKey]

  useLayoutEffect(() => {
    if (!actions || names.length === 0) return

    const action = actions[clip] ?? actions.Walking ?? actions.Running
    if (!action) return

    Object.values(actions).forEach((a) => {
      if (a && a !== action) a.stop()
    })

    action.reset()
    action.setEffectiveTimeScale(speed)
    action.setEffectiveWeight(1)
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1)
    action.clampWhenFinished = !loop
    action.play()
  }, [actions, names, animKey, clip, loop, speed])

  return (
    <group scale={fit.scale} rotation={rotation}>
      <primitive ref={groupRef}  object={clone} position={fit.position} />
    </group>
  )
}

export function PigAnimatedModel(props: PigAnimatedModelProps) {
  const { fallback = null, ...inner } = props
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <PigAnimatedModelInner {...inner} />
      </Suspense>
    </ModelErrorBoundary>
  )
}
