import { useEffect, useRef } from 'react'
import type { InputState } from '@/types/game'

const keys: Record<string, boolean> = {}

export function useKeyboardInput() {
  const inputRef = useRef<InputState>({
    forward: 0,
    lateral: 0,
    altitude: 0,
    yaw: 0,
    drop: false,
  })

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
      keys[e.key.toLowerCase()] = true
      if (e.key === ' ') keys.space = true
    }

    function onKeyUp(e: KeyboardEvent) {
      keys[e.key.toLowerCase()] = false
      if (e.key === ' ') keys.space = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  function readInput({ inverted }: { inverted: boolean }) {
    let forward = 0
    let lateral = 0
    let altitude = 0
    let yaw = 0

    if (keys.w || keys.arrowup) forward += 1
    if (keys.s || keys.arrowdown) forward -= 1
    if (keys.a || keys.arrowleft) lateral -= 1
    if (keys.d || keys.arrowright) lateral += 1
    if (keys.r) altitude += 1
    if (keys.f) altitude -= 1
    if (keys.q) yaw -= 1
    if (keys.e) yaw += 1

    if (inverted) {
      lateral = -lateral
      altitude = -altitude
      yaw = -yaw
    }

    const drop = Boolean(keys.space)
    inputRef.current = { forward, lateral, altitude, yaw, drop }
    return inputRef.current
  }

  return { readInput }
}
