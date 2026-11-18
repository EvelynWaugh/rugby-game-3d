import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardInput } from '@/hooks/use-keyboard-input'
import { useGameStore } from '@/stores/use-game-store'
import { stepGame } from '@/systems/step-game'

const TICK = 1 / 60

export function useGameLoop() {
  const { readInput } = useKeyboardInput()
  const remainder = useRef(0)
  useFrame((_, delta) => {
    if (useGameStore.getState().gameState !== 'playing') {
      remainder.current = 0
      return
    }
    remainder.current += Math.min(delta, 0.1)
    const controls = readInput({ inverted: false })
    let state = useGameStore.getState()
    if (remainder.current < TICK) return
    while (remainder.current >= TICK && state.gameState === 'playing') {
      state = { ...state, ...stepGame(state, controls) }
      remainder.current -= TICK
    }
    useGameStore.setState(state)
  }, -1)
}
