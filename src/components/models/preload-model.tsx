import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

export function PreloadModel({ path, onLoaded }: { path: string; onLoaded: (path: string) => void }) {
  useGLTF(path)
  useEffect(() => onLoaded(path), [path, onLoaded])
  return null
}
