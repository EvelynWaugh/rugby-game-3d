import { lazy, Suspense, useEffect } from 'react'
import { DIFFICULTY_KEYS } from '@/constants/difficulty'
import { DifficultyMenu } from '@/components/ui/difficulty-menu'
import { GameOver } from '@/components/ui/game-over'
import { Hud } from '@/components/ui/hud'
import { LevelClear } from '@/components/ui/level-clear'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { StartMenu } from '@/components/ui/start-menu'
import { useModelPreload } from '@/hooks/use-model-preload'
import { getModelPreloadStatus } from '@/systems/preload-models'
import { useGameStore } from '@/stores/use-game-store'

const GameScene = lazy(() =>
  import('@/scenes/game-scene').then((mod) => ({ default: mod.GameScene })),
)

export function GameShell() {
  const assets = useModelPreload()
  const gameState = useGameStore((s) => s.gameState)
  const diffSel = useGameStore((s) => s.diffSel)
  const startSel = useGameStore((s) => s.startSel)
  const score = useGameStore((s) => s.score)
  const levelData = useGameStore((s) => s.levelData)
  const setGameState = useGameStore((s) => s.setGameState)
  const setDiffSel = useGameStore((s) => s.setDiffSel)
  const setStartSel = useGameStore((s) => s.setStartSel)
  const setDifficulty = useGameStore((s) => s.setDifficulty)
  const setBossRoundOnly = useGameStore((s) => s.setBossRoundOnly)
  const startGame = useGameStore((s) => s.startGame)
  const startBossGame = useGameStore((s) => s.startBossGame)
  const resetGame = useGameStore((s) => s.resetGame)
  const bossRoundOnly = useGameStore((s) => s.bossRoundOnly)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!getModelPreloadStatus().ready) return

      const state = useGameStore.getState()

      if (state.gameState === 'difficulty') {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
          setDiffSel((state.diffSel + 2) % 3)
        }
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
          setDiffSel((state.diffSel + 1) % 3)
        }
        if (e.key === ' ' || e.key === 'Enter') {
          setDifficulty(DIFFICULTY_KEYS[state.diffSel])
          if (state.bossRoundOnly) startBossGame()
          else startGame()
        }
      } else if (state.gameState === 'start') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          setStartSel(1 - state.startSel)
        }
        if (e.key.toLowerCase() === 'l' || e.key === '5') {
          setStartSel(1)
          setGameState('difficulty')
        }
        if (e.key === ' ' || e.key === 'Enter') {
          setBossRoundOnly(state.startSel === 1)
          setGameState('difficulty')
        }
      } else if (state.gameState === 'levelclear' && (e.key === ' ' || e.key === 'Enter')) {
        resetGame()
      } else if ((state.gameState === 'gameover' || state.gameState === 'victory') && (e.key === ' ' || e.key === 'Enter')) {
        resetGame()
      } else if (state.gameState === 'playing' && e.key === ' ') {
        e.preventDefault()
        useGameStore.getState().queueDrop()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    setDiffSel,
    setDifficulty,
    setGameState,
    setStartSel,
    setBossRoundOnly,
    startGame,
    startBossGame,
    resetGame,
  ])

  if (!assets.ready) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <LoadingScreen
          progress={assets.progress}
          loaded={assets.loaded}
          total={assets.total}
          item={assets.item}
          error={assets.error}
          onRetry={assets.retry}
        />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Suspense fallback={null}>
        <GameScene />
      </Suspense>
      <Hud />

      {gameState === 'start' && (
        <StartMenu
          startSel={startSel}
          onSelectChange={setStartSel}
          onContinue={() => {
            setBossRoundOnly(startSel === 1)
            setGameState('difficulty')
          }}
        />
      )}

      {gameState === 'difficulty' && (
        <DifficultyMenu
          diffSel={diffSel}
          onSelectChange={setDiffSel}
          onDeploy={() => {
            setDifficulty(DIFFICULTY_KEYS[diffSel])
            if (bossRoundOnly) startBossGame()
            else startGame()
          }}
        />
      )}

      {gameState === 'levelclear' && levelData && (
        <LevelClear
          levelName={levelData.name}
          clearMessage={levelData.clear}
          score={score}
          onContinue={resetGame}
        />
      )}

      {(gameState === 'gameover' || gameState === 'victory') && (
        <GameOver
          score={score}
          victory={gameState === 'victory'}
          onRestart={resetGame}
        />
      )}
    </div>
  )
}
