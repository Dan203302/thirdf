import type { IssPoint } from "./hooks";

type IssTrendTableProps = {
  points: IssPoint[];
};

function formatTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(11, 19);
}

export function IssTrendTable({ points }: IssTrendTableProps) {
  const limited = points.slice(-240);
  const speeds = limited.map((p) => p.velocity).filter((v) => typeof v === "number");
  const alts = limited.map((p) => p.altitude).filter((v) => typeof v === "number");
  const maxSpeed = speeds.length ? Math.max(...speeds) : 0;
  const maxAlt = alts.length ? Math.max(...alts) : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-wide text-slate-100">
            ISS telemetry
          </h1>
          <span className="text-[11px] text-slate-500">Последние точки орбиты</span>
        </div>
        <div className="relative max-h-[420px] overflow-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
          <table className="min-w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-950/80 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">t (UTC)</th>
                <th className="px-3 py-2">lat</th>
                <th className="px-3 py-2">lon</th>
                <th className="px-3 py-2">velocity</th>
                <th className="px-3 py-2">altitude</th>
              </tr>
            </thead>
            <tbody>
              {!limited.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-center text-xs text-slate-500">
                    нет данных
                  </td>
                </tr>
              )}
              {limited.map((p) => (
                <tr key={p.at} className="odd:bg-slate-900/40 even:bg-slate-900/10">
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    <code className="rounded bg-slate-950/80 px-2 py-[2px] text-[10px]">
                      {formatTime(p.at)}
                    </code>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-200">
                    {p.lat.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-200">
                    {p.lon.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-200">
                    <div className="flex items-center gap-2">
                      <span>{p.velocity.toFixed(0)}</span>
                      <div className="h-1.5 flex-1 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-sky-500"
                          style={{ width: maxSpeed ? `${Math.min(100, (p.velocity / maxSpeed) * 100)}%` : "0%" }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-200">
                    <div className="flex items-center gap-2">
                      <span>{p.altitude.toFixed(0)}</span>
                      <div className="h-1.5 flex-1 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: maxAlt ? `${Math.min(100, (p.altitude / maxAlt) * 100)}%` : "0%" }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
