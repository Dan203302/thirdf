type MetricCardsProps = {
  velocity: number | null | undefined;
  altitude: number | null | undefined;
  jwstLoading: boolean;
  jwstError: string | null;
  jwstCount: number;
};

export function MetricCards({ velocity, altitude, jwstLoading, jwstError, jwstCount }: MetricCardsProps) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-sky-900/40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-slate-400">
              Скорость МКС
            </div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">
              {velocity != null ? velocity.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) : "—"}
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 opacity-80 blur-xs" />
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-emerald-900/40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-slate-400">
              Высота МКС
            </div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">
              {altitude != null ? altitude.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) : "—"}
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-400 to-lime-400 opacity-80 blur-xs" />
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-fuchsia-900/40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-slate-400">
              JWST
            </div>
            <div className="mt-1 text-sm text-slate-300">
              {jwstLoading
                ? "Загрузка галереи…"
                : jwstError
                ? jwstError
                : `Изображений: ${jwstCount}`}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-sky-400 opacity-80 blur-xs" />
        </div>
      </div>
    </section>
  );
}
