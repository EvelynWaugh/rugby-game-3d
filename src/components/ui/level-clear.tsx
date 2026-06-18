interface LevelClearProps {
  levelName: string
  clearMessage: string
  score: number
  onContinue: () => void
}

export function LevelClear({ levelName, clearMessage, score, onContinue }: LevelClearProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-xl border border-[#1e2733] bg-[#0a0e14] p-8 text-center shadow-2xl">
        <p className="mono text-xs tracking-[0.3em] text-green-400">LEVEL CLEARED</p>
        <h2 className="mt-2 text-2xl font-bold text-white">{levelName}</h2>
        <p className="mt-2 text-sm text-slate-400">{clearMessage}</p>
        <p className="mono mt-4 text-lg text-[#f39200]">SCORE: {score}</p>
        <p className="mono mt-2 text-xs text-slate-500">
          Level 2+ coming in next iteration. Press SPACE or click to return to menu.
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="mono mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-500"
        >
          CONTINUE
        </button>
      </div>
    </div>
  )
}
