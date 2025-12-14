import type { LegacyRow } from "./hooks";

type LegacyTableProps = {
  rows: LegacyRow[];
};

export function LegacyTable({ rows }: LegacyTableProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm fade-up-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-100">
          Legacy telemetry
        </h2>
        <span className="text-[11px] text-slate-500">Pascal CSV → Postgres</span>
      </div>
      <div className="relative max-h-[420px] overflow-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="min-w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-950/80 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">recorded_at</th>
              <th className="px-3 py-2">is_ok</th>
              <th className="px-3 py-2">voltage</th>
              <th className="px-3 py-2">temp</th>
              <th className="px-3 py-2">source_file</th>
            </tr>
          </thead>
          <tbody>
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-3 py-3 text-center text-xs text-slate-500">
                  нет данных
                </td>
              </tr>
            )}
            {rows.map((row, idx) => {
              const ok = !!row.is_ok;
              return (
                <tr
                  key={row.id ?? idx}
                  className="odd:bg-slate-900/40 even:bg-slate-900/10 transition-colors hover:bg-slate-800/70"
                >
                  <td className="px-3 py-2 text-[11px] text-slate-400">{row.id}</td>
                  <td className="px-3 py-2 text-[11px] text-slate-300 whitespace-nowrap">
                    <code className="rounded bg-slate-900/80 px-2 py-[2px]">
                      {row.recorded_at}
                    </code>
                  </td>
                  <td className="px-3 py-2 text-[11px]">
                    <span
                      className={
                        "inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] " +
                        (ok
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300")
                      }
                    >
                      <span
                        className={
                          "h-1.5 w-1.5 rounded-full " +
                          (ok ? "bg-emerald-400" : "bg-rose-400")
                        }
                      />
                      {ok ? "ok" : "alarm"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {row.voltage?.toFixed ? row.voltage.toFixed(2) : row.voltage}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {row.temp?.toFixed ? row.temp.toFixed(2) : row.temp}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300 max-w-[220px] truncate" title={row.source_file}>
                    {row.source_file}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
