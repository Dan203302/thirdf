"use client";

type IssMapProps = {
  lat?: number | null;
  lon?: number | null;
};

export default function IssMap({ lat, lon }: IssMapProps) {
  const hasCoords = typeof lat === "number" && typeof lon === "number";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-100">
          Положение МКС
        </h2>
        <span className="text-[11px] text-slate-500">координаты из /api/iss/last</span>
      </div>
      <div className="flex h-32 items-center justify-center rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300">
        {hasCoords ? (
          <div className="text-center">
            <div>lat: {lat?.toFixed(4)}</div>
            <div>lon: {lon?.toFixed(4)}</div>
          </div>
        ) : (
          <div>Нет координат ISS</div>
        )}
      </div>
    </div>
  );
}
