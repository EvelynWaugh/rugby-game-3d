import { useGameStore } from '@/stores/use-game-store'

function scramble(txt: string, active: boolean) {
  if (!active) return txt
  const chars = '▓▒░#@%&!?<>'
  return txt
    .split('')
    .map((c) => (c === ' ' ? ' ' : Math.random() < 0.4 ? chars[Math.floor(Math.random() * chars.length)] : c))
    .join('')
}

export function Hud() {
  const gameState = useGameStore((s) => s.gameState)
  const drone = useGameStore((s) => s.drone)
  const levelData = useGameStore((s) => s.levelData)
  const level = useGameStore((s) => s.level)
  const score = useGameStore((s) => s.score)
  const wind = useGameStore((s) => s.wind)
  const ewActive = useGameStore((s) => s.ewActive)
  const levelMessage = useGameStore((s) => s.levelMessage)

  if (gameState !== 'playing' || !drone || !levelData) return null

  const hpPct = Math.round((drone.hp / drone.maxhp) * 100)
  const muniUsed = levelData.muni - drone.munitions
  const windStr = levelData.wind
    ? `WIND ${wind.x.toFixed(1)} / ${wind.z.toFixed(1)}`
    : 'WIND CALM'

  return (
    <div className="pointer-events-none absolute inset-0 z-10 p-4">
      <img
        src="/assets/img/shevron_gold.svg"
        alt=""
        className="absolute left-3 top-12 h-24 opacity-50"
      />

      <div className="absolute left-4 top-4 flex flex-col gap-1">
        <p className="mono text-xs text-[#f39200]">
          LVL {level} — {scramble(levelData.name, ewActive)}
        </p>
        <p className="mono text-[10px] text-slate-500">{scramble(levelData.env, ewActive)}</p>
      </div>

      <div className="absolute right-4 top-4 text-right">
        <p className="mono text-lg font-bold text-white">{score.toString().padStart(6, '0')}</p>
        <p className="mono text-[10px] text-slate-500">SCORE</p>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
        <div className="flex-1 max-w-xs">
          <p className="mono mb-1 text-[10px] text-slate-400">BATTERY {hpPct}%</p>
          <div className="h-2 overflow-hidden rounded bg-[#1e2733]">
            <div
              className="h-full rounded bg-gradient-to-r from-red-500 via-yellow-400 to-green-400 transition-all"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="mono text-2xl font-bold text-[#f39200]">{drone.munitions}</p>
          <p className="mono text-[10px] text-slate-500">
            MUNITIONS ({muniUsed}/{levelData.muni} used)
          </p>
        </div>

        <div className="mono text-right text-[10px] text-slate-500">
          <p className={ewActive ? 'text-purple-400' : ''}>{scramble(windStr, ewActive)}</p>
          {ewActive && <p className="text-purple-400 animate-pulse">EW JAMMING ACTIVE</p>}
        </div>
      </div>

      {levelMessage && (
        <div className="absolute bottom-20 left-1/2 max-w-lg -translate-x-1/2 text-center">
          <p className="mono text-xs text-slate-400">{scramble(levelMessage, ewActive)}</p>
        </div>
      )}
    </div>
  )
}
