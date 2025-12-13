import type { UseAstroEventsResult } from "./hooks";

type AstroEventsProps = {
  astro: UseAstroEventsResult;
};

export function AstroEvents({ astro }: AstroEventsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm fade-up-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-slate-100">
            Астрономические события
          </h2>
          <span className="text-[11px] text-slate-500">AstronomyAPI</span>
        </div>
        <form
          className="mb-3 flex flex-wrap gap-2 text-xs text-slate-200"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const data = new FormData(form);
            astro.load({
              lat: String(data.get("lat") || ""),
              lon: String(data.get("lon") || ""),
              days: String(data.get("days") || ""),
            });
          }}
        >
          <input
            name="lat"
            type="number"
            step="0.0001"
            defaultValue={astro.query.lat}
            className="w-24 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500"
            placeholder="lat"
          />
          <input
            name="lon"
            type="number"
            step="0.0001"
            defaultValue={astro.query.lon}
            className="w-24 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500"
            placeholder="lon"
          />
          <input
            name="days"
            type="number"
            min={1}
            max={30}
            defaultValue={astro.query.days}
            className="w-20 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500"
            placeholder="дней"
          />
          <button
            type="submit"
            className="rounded-full bg-sky-500 px-4 py-1 text-xs font-medium text-slate-950 shadow-sm shadow-sky-900/40 transition-colors hover:bg-sky-400"
          >
            Показать
          </button>
        </form>

        <div className="relative max-h-64 overflow-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
          <table className="min-w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-950/80 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Тело</th>
                <th className="px-3 py-2">Событие</th>
                <th className="px-3 py-2">Когда (UTC)</th>
                <th className="px-3 py-2">Дополнительно</th>
              </tr>
            </thead>
            <tbody>
              {astro.loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-3 text-center text-xs text-slate-400"
                  >
                    Загрузка…
                  </td>
                </tr>
              )}
              {!astro.loading && astro.error && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-3 text-center text-xs text-rose-400"
                  >
                    {astro.error}
                  </td>
                </tr>
              )}
              {!astro.loading && !astro.error && !astro.rows.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-3 text-center text-xs text-slate-500"
                  >
                    Нет данных
                  </td>
                </tr>
              )}
              {astro.rows.map((row, idx) => (
                <tr
                  key={`${row.name}-${row.when}-${idx}`}
                  className="odd:bg-slate-900/40 even:bg-slate-900/10 transition-colors hover:bg-slate-800/70"
                >
                  <td className="px-3 py-2 text-[11px] text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-100">
                    {row.name || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-200">
                    {row.type || "—"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    <code className="rounded bg-slate-900/80 px-2 py-[2px]">
                      {row.when || "—"}
                    </code>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {row.extra || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details className="mt-3 text-xs text-slate-400">
          <summary className="cursor-pointer select-none text-[11px] uppercase tracking-wide text-slate-500">
            Полный JSON
          </summary>
          <pre className="mt-2 max-h-52 overflow-auto rounded-xl bg-slate-950/70 p-3 text-[11px] leading-relaxed text-slate-300">
            {astro.raw || "нет данных"}
          </pre>
        </details>
      </div>
    </div>
  );
}
