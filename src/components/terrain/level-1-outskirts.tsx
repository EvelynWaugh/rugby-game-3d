import { useMemo } from 'react'
import * as THREE from 'three'
import { getLevelPath } from '@/systems/path-system'

export function Level1Outskirts() {
  const curve = useMemo(() => getLevelPath(1), [])

  const roadGeometry = useMemo(() => {
    const segments = 200
    const width = 8
    const vertices: number[] = []
    const indices: number[] = []

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const point = curve.getPointAt(t)
      const tangent = curve.getTangentAt(t).normalize()
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize()

      const left = point.clone().addScaledVector(right, -width / 2)
      const rightPt = point.clone().addScaledVector(right, width / 2)

      vertices.push(left.x, 0.02, left.z)
      vertices.push(rightPt.x, 0.02, rightPt.z)

      if (i < segments) {
        const base = i * 2
        indices.push(base, base + 1, base + 2)
        indices.push(base + 1, base + 3, base + 2)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [curve])

  const props = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 40; i++) {
      const t = 0.1 + (i / 40) * 0.85
      const point = curve.getPointAt(t)
      const side = i % 2 === 0 ? -1 : 1
      positions.push([point.x + side * (12 + (i % 5)), 0, point.z + (i % 7) * 2 - 6])
    }
    return positions
  }, [curve])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -240]} receiveShadow>
        <planeGeometry args={[200, 600]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>

      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>

      {props.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh castShadow position={[0, 1.5, 0]}>
            <boxGeometry args={[0.6, 3, 0.6]} />
            <meshStandardMaterial color={i % 3 === 0 ? '#1a4a1a' : '#2a6a2a'} />
          </mesh>
          <mesh castShadow position={[0.8, 0.4, 0.5]}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -0.5, -250]} receiveShadow>
        <boxGeometry args={[300, 1, 600]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
    </group>
  )
}
