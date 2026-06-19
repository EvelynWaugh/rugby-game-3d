import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { BALL_MODEL } from '@/constants/models'
import { fitObjectToSize, enableShadows } from '@/utils/model-fit'

useGLTF.preload(BALL_MODEL.path)

function BallGlbMesh() {
  const { scene } = useGLTF(BALL_MODEL.path)
  const mesh = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Group
    enableShadows(cloned)
    fitObjectToSize(cloned, 1)
    return cloned
  }, [scene])

  return <primitive object={mesh} />
}

function BallEllipsoid() {
  return (
    <mesh castShadow scale={[1, 0.65, 1.35]}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshStandardMaterial color="#b85c1a" roughness={0.55} metalness={0.08} />
    </mesh>
  )
}

export function BallVisual() {
  return (
    <Suspense fallback={<BallEllipsoid />}>
      <BallGlbMesh />
    </Suspense>
  )
}
