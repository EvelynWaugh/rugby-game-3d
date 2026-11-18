import { useCallback, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { ALL_MODEL_PATHS } from '@/constants/models'

export function useModelPreload() {
  const [loaded, setLoaded] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const total = ALL_MODEL_PATHS.length
  const path = ALL_MODEL_PATHS[loaded]
  const item = path?.split('/').pop() ?? ''
  const onLoaded = useCallback((finishedPath: string) => {
    setLoaded(index => ALL_MODEL_PATHS[index] === finishedPath ? index + 1 : index)
  }, [])
  function retry() {
    useGLTF.clear(path)
    setError(null)
    setAttempt(n => n + 1)
  }
  return {
    loaded, total, path, item, error, attempt, ready: loaded === total,
    progress: Math.round(loaded / total * 100), onLoaded, setError, retry,
  }
}
