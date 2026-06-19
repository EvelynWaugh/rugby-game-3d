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
