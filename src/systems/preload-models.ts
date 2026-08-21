import { useGLTF } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ALL_MODEL_PATHS } from '@/constants/models'

export interface ModelPreloadStatus {
  loaded: number
  total: number
  progress: number
  ready: boolean
  error: string | null
  item: string
}

const total = ALL_MODEL_PATHS.length

let status: ModelPreloadStatus = {
  loaded: 0,
  total,
  progress: 0,
  ready: false,
  error: null,
  item: '',
}

const listeners = new Set<(next: ModelPreloadStatus) => void>()
let preloadPromise: Promise<void> | null = null

function emit() {
  for (const listener of listeners) listener(status)
}

function setStatus(partial: Partial<ModelPreloadStatus>) {
  status = { ...status, ...partial }
  emit()
}

function fileLabel(path: string) {
  const parts = path.split('/')
  return parts[parts.length - 1] || path
}

async function loadAllModels() {
  let loaded = 0

  setStatus({ loaded: 0, progress: 0, ready: false, error: null, item: '' })

  await Promise.all(
    ALL_MODEL_PATHS.map(async (path) => {
      const loader = new GLTFLoader()
      setStatus({ item: fileLabel(path) })
      try {
        await loader.loadAsync(path)
      } catch {
        throw new Error(`Failed to load ${fileLabel(path)}`)
      }
      useGLTF.preload(path)
      loaded += 1
      setStatus({
        loaded,
        progress: Math.round((loaded / total) * 100),
        item: fileLabel(path),
      })
    }),
  )

  setStatus({ ready: true, progress: 100, item: '', error: null })
}

export function getModelPreloadStatus() {
  return status
}

export function subscribeModelPreload(listener: (next: ModelPreloadStatus) => void) {
  listeners.add(listener)
  listener(status)
  return () => {
    listeners.delete(listener)
  }
}

export function startModelPreload() {
  if (preloadPromise) return preloadPromise

  preloadPromise = loadAllModels().catch((err: unknown) => {
    preloadPromise = null
    const message = err instanceof Error ? err.message : 'Failed to load 3D models'
    setStatus({ ready: false, error: message })
    throw err
  })

  return preloadPromise
}

export function retryModelPreload() {
  preloadPromise = null
  setStatus({
    loaded: 0,
    total,
    progress: 0,
    ready: false,
    error: null,
    item: '',
  })
  return startModelPreload()
}
