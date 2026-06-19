interface StartMenuProps {
  startSel: number
  onSelectChange: (sel: number) => void
  onContinue: () => void
}

export function StartMenu({ startSel, onSelectChange, onContinue }: StartMenuProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07090d]/90">
      <div className="w-full max-w-lg rounded-xl border border-[#1e2733] bg-[#0a0e14] p-8 text-center shadow-2xl">
        <img
          src="/assets/img/shevron_gold.svg"
          alt=""
          className="mx-auto mb-4 h-20 opacity-80"
        />
        <p className="mono text-xs tracking-[0.3em] text-[#f39200]">SKY SOVEREIGN</p>
        <h1 className="mt-2 text-3xl font-bold text-white">3D OPERATIONS</h1>
        <p className="mt-2 text-sm text-slate-400">
          FPV drone bomber. Drop rugby-ball munitions on Iron Grid targets.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {['FULL CAMPAIGN', 'BOSS ROUND — LEVEL 5'].map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelectChange(i)}
              className={`mono rounded-lg border px-4 py-3 text-left text-sm transition ${
                startSel === i
                  ? 'border-[#f39200] bg-[#f39200]/10 text-[#f39200]'
                  : 'border-[#1e2733] text-slate-400 hover:border-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mono mt-6 w-full rounded-lg bg-[#f39200] px-4 py-3 font-semibold text-black transition hover:bg-[#ffb347]"
        >
          SELECT DIFFICULTY
        </button>

        <p className="mono mt-4 text-xs text-slate-500">
          W/S forward/back · A/D strafe · R/F altitude · Q/E rotate · SPACE drop
        </p>
      </div>
    </div>
  )
}
