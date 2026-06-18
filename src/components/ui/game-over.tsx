interface GameOverProps {
  score: number
  victory?: boolean
  onRestart: () => void
}

export function GameOver({ score, victory = false, onRestart }: GameOverProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-xl border border-[#1e2733] bg-[#0a0e14] p-8 text-center shadow-2xl">
        <p className={`mono text-xs tracking-[0.3em] ${victory ? 'text-[#f39200]' : 'text-red-400'}`}>
          {victory ? 'VICTORY' : 'GAME OVER'}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          {victory ? 'SWINE OVERLORD DEFEATED' : 'DRONE LOST'}
        </h2>
        <p className="mono mt-4 text-lg text-slate-300">FINAL SCORE: {score}</p>
        <button
          type="button"
          onClick={onRestart}
          className="mono mt-6 rounded-lg bg-[#f39200] px-6 py-3 font-semibold text-black hover:bg-[#ffb347]"
        >
          RESTART
        </button>
      </div>
    </div>
  )
}
