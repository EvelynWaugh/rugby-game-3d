import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group, Object3D } from 'three'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ModelErrorBoundary } from '@/components/models/model-error-boundary'
import { WeaponAk } from '@/components/models/weapon-ak'
import { useGameStore } from '@/stores/use-game-store'
import { PIG_CLIPS, PIG_MODEL, WEAPON_AK, type PigAnimKey } from '@/constants/models'
import { enableShadows, fitSkinnedToHeight, fixSkinnedMaterials } from '@/utils/model-fit'

useGLTF.preload(PIG_MODEL.path)

const handWorldPos = new THREE.Vector3()
const handWorldQuat = new THREE.Quaternion()
const parentWorldQuat = new THREE.Quaternion()
const barrelInHand = new THREE.Vector3(-1, 0, 0).applyEuler(new THREE.Euler(...WEAPON_AK.attach.rotation))
const barrelWorld = new THREE.Vector3()
const sightLine = new THREE.Vector3()
const barrelTurn = new THREE.Quaternion()

interface PigAnimatedModelProps {
  animKey: PigAnimKey
  speed?: number
  showWeapon?: boolean
  firedAt?: number
  rotation?: [number, number, number]
  fallback?: React.ReactNode
}

function findBone(root: Object3D, name: string) {
  return root.getObjectByName(name) ?? null
}

function PigAnimatedModelInner({
  animKey,
  speed = 1,
  showWeapon = false,
  firedAt,
  rotation = [0, 0, 0],
}: Omit<PigAnimatedModelProps, 'fallback'>) {
  const cloneRef = useRef<Object3D>(null)
  const rootRef = useRef<Group>(null)
  const weaponRef = useRef<Group>(null)
  const activeRef = useRef<THREE.AnimationAction | null>(null)
  const { scene, animations } = useGLTF(PIG_MODEL.path)

  const { clone, fit, rightHand } = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Group
    enableShadows(cloned)
    fixSkinnedMaterials(cloned)
    return {
      clone: cloned,
      fit: fitSkinnedToHeight(cloned, PIG_MODEL.targetHeight),
      rightHand: findBone(cloned, 'RightHand'),
    }
  }, [scene])

  const { actions, names } = useAnimations(animations, cloneRef)
  const { clip, loop } = PIG_CLIPS[animKey]

  useLayoutEffect(() => {
    if (!actions || names.length === 0) return

    const action = actions[clip] ?? actions.Walking ?? actions.Running
    if (!action) return

    const prev = activeRef.current
    if (prev && prev !== action) prev.fadeOut(0.18)

    action.reset()
    action.setEffectiveWeight(1)
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1)
    action.clampWhenFinished = !loop
    action.paused = false
    action.setEffectiveTimeScale(speed)
    action.fadeIn(prev ? 0.18 : 0).play()

    activeRef.current = action
  }, [actions, names, animKey, clip, loop, speed])

  useFrame(() => {
    const weapon = weaponRef.current
    const root = rootRef.current
    if (!weapon || !root || !rightHand) return
    if (!showWeapon) {
      weapon.visible = false
      return
    }

    rightHand.updateWorldMatrix(true, false)
    rightHand.getWorldPosition(handWorldPos)
    rightHand.getWorldQuaternion(handWorldQuat)
    const drone = useGameStore.getState().drone
    if (drone) {
      // Keep the animated grip and roll while turning the fitted rifle toward the drone.
      barrelWorld.copy(barrelInHand).applyQuaternion(handWorldQuat)
      sightLine.copy(drone.position).sub(handWorldPos).normalize()
      handWorldQuat.premultiply(barrelTurn.setFromUnitVectors(barrelWorld, sightLine))
    }
    root.updateWorldMatrix(true, false)
    root.worldToLocal(handWorldPos)
    root.getWorldQuaternion(parentWorldQuat)
    weapon.position.copy(handWorldPos)
    weapon.quaternion.copy(parentWorldQuat.invert()).multiply(handWorldQuat)
    weapon.visible = true
  })

  return (
    <group ref={rootRef} rotation={rotation}>
      <group scale={fit.scale}>
        <primitive ref={cloneRef} object={clone} position={fit.position} />
      </group>
      <group ref={weaponRef} visible={showWeapon}>
        <WeaponAk firedAt={firedAt} />
      </group>
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
