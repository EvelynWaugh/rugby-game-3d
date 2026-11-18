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
  const downView = useGameStore(s => s.downView)
  const remaining = useGameStore(s => [...s.soldiers, ...s.shelters, ...s.enemyDrones, ...s.ewTowers].filter(e => !e.dead).length)
  const score = useGameStore((s) => s.score)
  const wind = useGameStore((s) => s.wind)
  const ewActive = useGameStore((s) => s.ewActive)
  const showBrief = useGameStore(s => s.frame < 360)
  const levelMessage = useGameStore((s) => s.levelMessage)

  if (gameState !== 'playing' || !drone || !levelData) return null

  const hpPct = Math.round((drone.hp / drone.maxhp) * 100)
  const muniUsed = levelData.muni - drone.munitions
  const windStr = levelData.wind
    ? `WIND ${wind.x.toFixed(1)} / ${wind.z.toFixed(1)}`
    : 'WIND CALM'

  return (
    <div className="pointer-events-none absolute inset-0 z-10 p-4">
      {ewActive && <div aria-hidden="true" className="signal-static absolute inset-0" />}
      {downView && <div className="view-crosshair" aria-label="Overhead crosshair" />}
      {drone.netTicks > 0 && <p className="mono absolute left-1/2 top-12 -translate-x-1/2 rounded bg-black/70 px-3 py-1 text-amber-300">
        NET SNAG · {(drone.netTicks / 60).toFixed(1)}s
      </p>}
      {drone.hit > 0 && <div className="absolute inset-0 bg-red-700/25" />}


      <div className="flight-readout absolute left-4 top-4 flex flex-col gap-1">
        <p className="mono text-xs text-[#f39200]">
          LVL {level} — {scramble(levelData.name, ewActive)}
        </p>
        <p className="mono text-[10px] text-slate-200">{remaining} targets left</p>
      </div>

      <div className="flight-readout absolute right-4 top-4 text-right">
        <p className="mono text-lg font-bold text-white">{score.toString().padStart(6, '0')}</p>
        <p className="mono text-[10px] text-slate-500">SCORE</p>
      </div>

      <div className="flight-instruments absolute bottom-0 left-0 right-0 flex px-4 pb-3 pt-8 items-end justify-between gap-4">
        <div className="flex-1 max-w-xs">
          <p className="mono mb-1 text-[10px] text-slate-200">BATTERY {hpPct}%</p>
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
          <p>ALT {drone.altitude.toFixed(1)} · V {downView ? 'flight view' : 'overhead'} · Space drop</p>
          {ewActive && <p className="text-purple-400 animate-pulse">SIGNAL LOST</p>}
        </div>
      </div>

      {showBrief && levelMessage && (
        <div className="mission-brief absolute left-1/2 top-4 w-max max-w-[48%] -translate-x-1/2 text-center">
          <p className="mono text-xs text-slate-400">{scramble(levelMessage, ewActive)}</p>
        </div>
      )}
    </div>
  )
}
