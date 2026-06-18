import { create } from 'zustand'
import { createGameStore, type GameStoreState } from '@/stores/game-store'

export const useGameStore = create<GameStoreState>((set, get) => createGameStore(
  (fn) => set((state) => ({ ...state, ...fn(state) })),
  get,
))
