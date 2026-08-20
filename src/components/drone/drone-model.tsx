import { Suspense, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { ModelErrorBoundary } from '@/components/models/model-error-boundary'
import {
  DRONE_MAX_SPEED,
  DRONE_PROPELLER_SPIN_CRUISE,
  DRONE_PROPELLER_SPIN_HOVER,
} from '@/constants/game'
import { DRONE_MODEL, isDronePropellerNode } from '@/constants/models'
import { useGameStore } from '@/stores/use-game-store'
import { enableShadows, fitObjectToSize } from '@/utils/model-fit'
import { clamp } from '@/utils/math'

useGLTF.preload(DRONE_MODEL.path)

interface DroneModelProps {
  fallback?: React.ReactNode
}

function collectPropellerMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const named: THREE.Mesh[] = []
  const offset: THREE.Mesh[] = []

  root.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return
    const mesh = child as THREE.Mesh
    const parentName = mesh.parent?.name ?? ''
    if (isDronePropellerNode(mesh.name) || isDronePropellerNode(parentName)) {
      named.push(mesh)
      return
    }
    const origin =
      Math.hypot(mesh.position.x, mesh.position.z) > 0.01 ? mesh.position : mesh.parent?.position
    if (origin && Math.hypot(origin.x, origin.z) > 0.25) offset.push(mesh)
  })

  const meshes = named.length >= 2 ? named : offset
  return meshes.sort((a, b) => a.name.localeCompare(b.name))
}

/** Geometry is offset from the glTF node origin — pivot at the visual hub so spin stays in place */
function createPropellerPivot(mesh: THREE.Mesh): THREE.Group {
  mesh.geometry.computeBoundingBox()
  const geomCenter = new THREE.Vector3()
  mesh.geometry.boundingBox!.getCenter(geomCenter)

  const parent = mesh.parent
  if (!parent) {
    const fallback = new THREE.Group()
    fallback.name = `${mesh.name}_pivot`
    return fallback
  }

  const pivot = new THREE.Group()
  pivot.name = `${mesh.name}_pivot`

  const scaledOffset = geomCenter.clone().multiply(mesh.scale)
  pivot.position.copy(mesh.position).add(scaledOffset)
  pivot.quaternion.copy(mesh.quaternion)
  pivot.scale.copy(mesh.scale)

  parent.add(pivot)
  parent.remove(mesh)

  mesh.position.copy(geomCenter).negate()
  mesh.quaternion.identity()
  mesh.scale.set(1, 1, 1)
  pivot.add(mesh)

  return pivot
}

function DroneModelInner() {
  const { scene } = useGLTF(DRONE_MODEL.path)

  const { model, propellerPivots } = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Group
    enableShadows(cloned)

    const propellerMeshes = collectPropellerMeshes(cloned)
    const propellerPivots = propellerMeshes.map(createPropellerPivot)

    fitObjectToSize(cloned, DRONE_MODEL.targetSize)

    return { model: cloned, propellerPivots }
  }, [scene])

  useFrame((_, delta) => {
    const drone = useGameStore.getState().drone
    if (!drone || propellerPivots.length === 0) return

    const horizSpeed = Math.hypot(drone.velocity.x, drone.velocity.z)
    const speedT = clamp(horizSpeed / DRONE_MAX_SPEED, 0, 1)
    const spinRate =
      DRONE_PROPELLER_SPIN_HOVER + speedT * (DRONE_PROPELLER_SPIN_CRUISE - DRONE_PROPELLER_SPIN_HOVER)

    for (let i = 0; i < propellerPivots.length; i++) {
      const sign = i % 2 === 0 ? 1 : -1
      propellerPivots[i].rotateY(delta * spinRate * sign)
    }
  })

  return (
    <group
      position={DRONE_MODEL.offset}
      rotation={DRONE_MODEL.rotation}
      scale={DRONE_MODEL.scale}
    >
      <primitive object={model} />
    </group>
  )
}

export function DroneModel({ fallback = null }: DroneModelProps) {
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <DroneModelInner />
      </Suspense>
    </ModelErrorBoundary>
  )
}
