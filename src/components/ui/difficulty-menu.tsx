import { DIFFICULTIES, DIFFICULTY_KEYS } from '@/constants/difficulty'
import type { DifficultyKey } from '@/types/game'

interface DifficultyMenuProps {
  diffSel: number
  onSelectChange: (sel: number) => void
  onDeploy: () => void
}

export function DifficultyMenu({ diffSel, onSelectChange, onDeploy }: DifficultyMenuProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07090d]/90">
      <div className="w-full max-w-md rounded-xl border border-[#1e2733] bg-[#0a0e14] p-8 shadow-2xl">
        <div className="text-center">
          <p className="mono text-xs tracking-[0.3em] text-[#f39200]">DIFFICULTY</p>
          <h2 className="mt-2 text-2xl font-bold text-white">SELECT CLEARANCE</h2>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {DIFFICULTY_KEYS.map((key, i) => {
            const d = DIFFICULTIES[key as DifficultyKey]
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectChange(i)}
                className={`mono rounded-lg border px-4 py-3 text-left transition ${
                  diffSel === i
                    ? 'border-[#f39200] bg-[#f39200]/10 text-[#f39200]'
                    : 'border-[#1e2733] text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="font-bold">{d.name}</span>
                <span className="ml-2 text-xs opacity-70">
                  Battery {Math.round(d.battery * 100)}% · Wind ×{d.wind}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onDeploy}
          className="mono mt-6 w-full rounded-lg bg-[#f39200] px-4 py-3 font-semibold text-black transition hover:bg-[#ffb347]"
        >
          DEPLOY
        </button>
      </div>
    </div>
  )
}
