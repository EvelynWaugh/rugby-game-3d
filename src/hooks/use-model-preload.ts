import { useEffect, useState } from 'react'
import {
  getModelPreloadStatus,
  retryModelPreload,
  startModelPreload,
  subscribeModelPreload,
  type ModelPreloadStatus,
} from '@/systems/preload-models'

export function useModelPreload() {
  const [status, setStatus] = useState<ModelPreloadStatus>(getModelPreloadStatus)

  useEffect(() => {
    const unsubscribe = subscribeModelPreload(setStatus)
    startModelPreload()
    return unsubscribe
  }, [])

  return { ...status, retry: retryModelPreload }
}
