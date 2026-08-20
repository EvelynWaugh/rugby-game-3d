import * as THREE from 'three'

export function fitObjectToSize(object: THREE.Object3D, targetSize: number) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  const fitScale = targetSize / maxDim
  object.scale.multiplyScalar(fitScale)

  const fittedBox = new THREE.Box3().setFromObject(object)
  const center = fittedBox.getCenter(new THREE.Vector3())
  object.position.sub(center)

  return fitScale
}

/** Shift model so the bottom of its bounding box sits at y=0 */
export function groundObjectToFloor(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object)
  object.position.y -= box.min.y
}

export interface SkinnedFitResult {
  scale: number
  position: [number, number, number]
}

/** Fit a skinned character GLB to a target height and ground feet at y=0 */
export function fitSkinnedToHeight(object: THREE.Object3D, targetHeight: number): SkinnedFitResult {
  object.updateMatrixWorld(true)

  const meshes: THREE.SkinnedMesh[] = []
  object.traverse((child) => {
    if ((child as THREE.SkinnedMesh).isSkinnedMesh) meshes.push(child as THREE.SkinnedMesh)
  })

  const box = new THREE.Box3()
  if (meshes.length > 0) {
    for (const mesh of meshes) box.expandByObject(mesh)
  } else {
    box.setFromObject(object)
  }

  const size = box.getSize(new THREE.Vector3())
  const scale = targetHeight / Math.max(size.y, 0.001)
  const center = box.getCenter(new THREE.Vector3())

  return {
    scale,
    position: [-center.x, -box.min.y, -center.z],
  }
}

export function fixSkinnedMaterials(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return
    const mesh = child as THREE.Mesh
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const mat of mats) {
      if (!mat) continue
      mat.side = THREE.DoubleSide
      if (mat.transparent) mat.depthWrite = true
    }
  })
}

export function enableShadows(object: THREE.Object3D) {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
  })
}

export function tintMeshes(object: THREE.Object3D, color: string, emissiveIntensity = 0.08) {
  const tint = new THREE.Color(color)
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of mats) {
        if (!mat) continue
        const m = mat as THREE.MeshStandardMaterial
        if (m.color) m.color.lerp(tint, 0.35)
        if (m.emissive) {
          m.emissive.set(tint)
          m.emissiveIntensity = emissiveIntensity
        }
      }
    }
  })
}
