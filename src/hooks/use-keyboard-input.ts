import { useEffect, useRef } from 'react'
import type { InputState } from '@/types/game'



export function useKeyboardInput() {
  const keys = useRef<Record<string, boolean>>({}).current
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
      if (e.key === 'ArrowUp') keys.arrowup = true
      if (e.key === 'ArrowDown') keys.arrowdown = true
      if (e.key === 'ArrowLeft') keys.arrowleft = true
      if (e.key === 'ArrowRight') keys.arrowright = true
      if (e.key === 'PageUp') keys.pageup = true
      if (e.key === 'PageDown') keys.pagedown = true
    }

    function onKeyUp(e: KeyboardEvent) {
      keys[e.key.toLowerCase()] = false
      if (e.key === ' ') keys.space = false
      if (e.key === 'ArrowUp') keys.arrowup = false
      if (e.key === 'ArrowDown') keys.arrowdown = false
      if (e.key === 'ArrowLeft') keys.arrowleft = false
      if (e.key === 'ArrowRight') keys.arrowright = false
      if (e.key === 'PageUp') keys.pageup = false
      if (e.key === 'PageDown') keys.pagedown = false
    }

    function clearKeys() {
      for (const key of Object.keys(keys)) delete keys[key]
    }
    window.addEventListener('blur', clearKeys)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      clearKeys()
      window.removeEventListener('blur', clearKeys)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [keys])

  function readInput({ inverted }: { inverted: boolean }) {
    let forward = 0
    let altitude = 0
    let yaw = 0

    if (keys.w || keys.arrowup) forward += 1
    if (keys.s || keys.arrowdown) forward -= 1
    if (keys.arrowleft || keys.a) yaw -= 1
    if (keys.arrowright || keys.d) yaw += 1
    if (keys.r || keys.pageup) altitude += 1
    if (keys.f || keys.pagedown) altitude -= 1

    if (inverted) {
      altitude = -altitude
      yaw = -yaw
    }

    const drop = Boolean(keys.space)
    inputRef.current = { forward, lateral: 0, altitude, yaw, drop }
    return inputRef.current
  }

  return { readInput }
}
