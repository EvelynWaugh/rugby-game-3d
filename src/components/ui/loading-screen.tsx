interface LoadingScreenProps {
  progress: number
  loaded: number
  total: number
  item: string
  error: string | null
  onRetry: () => void
}

export function LoadingScreen({
  progress,
  loaded,
  total,
  item,
  error,
  onRetry,
}: LoadingScreenProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#07090d]">
      <div className="w-full max-w-md rounded-xl border border-[#1e2733] bg-[#0a0e14] p-8 text-center shadow-2xl">
        <img
          src="/assets/img/shevron_gold.svg"
          alt=""
          className="mx-auto mb-4 h-20 opacity-80"
        />
        <p className="mono text-xs tracking-[0.3em] text-[#f39200]">SKY SOVEREIGN</p>
        <h1 className="mt-2 text-2xl font-bold text-white">LOADING OPERATION</h1>
        <p className="mt-2 text-sm text-slate-400">
          Staging all 3D assets before deployment.
        </p>

        <div className="mt-6">
          <div className="mb-2 flex justify-between font-mono text-[10px] text-slate-500">
            <span>{error ? 'LOAD FAILED' : item ? `LOADING ${item}` : 'STANDBY'}</span>
            <span>
              {loaded}/{total} · {progress}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-[#1e2733]">
            <div
              className={`h-full rounded transition-all duration-200 ${
                error ? 'bg-red-500' : 'bg-gradient-to-r from-[#f39200] to-[#ffb347]'
              }`}
              style={{ width: `${error ? 100 : progress}%` }}
            />
          </div>
        </div>

        {error ? (
          <>
            <p className="mono mt-4 text-xs text-red-400">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mono mt-6 w-full rounded-lg bg-[#f39200] px-4 py-3 font-semibold text-black transition hover:bg-[#ffb347]"
            >
              RETRY
            </button>
          </>
        ) : (
          <p className="mono mt-4 text-xs text-slate-500">
            Mission starts when every model is in cache.
          </p>
        )}
      </div>
    </div>
  )
}
