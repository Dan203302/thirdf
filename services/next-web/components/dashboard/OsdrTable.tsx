type OsdrItem = {
  id: string | number | null;
  dataset_id?: string | null;
  title?: string | null;
  status?: string | null;
  updated_at?: string | null;
  inserted_at?: string | null;
  rest_url?: string | null;
  raw?: unknown;
};

type OsdrTableProps = {
  items: OsdrItem[];
};

export function OsdrTable({ items }: OsdrTableProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-base font-semibold tracking-wide text-slate-100">
          NASA OSDR
        </h1>
        <span className="text-[11px] text-slate-500">Нормализованный список датасетов</span>
      </div>
      <div className="relative max-h-[480px] overflow-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="min-w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-950/80 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">dataset_id</th>
              <th className="px-3 py-2">title</th>
              <th className="px-3 py-2">REST_URL</th>
              <th className="px-3 py-2">updated_at</th>
              <th className="px-3 py-2">inserted_at</th>
              <th className="px-3 py-2">raw</th>
            </tr>
          </thead>
          <tbody>
            {!items.length && (
              <tr>
                <td colSpan={7} className="px-3 py-3 text-center text-xs text-slate-500">
                  нет данных
                </td>
              </tr>
            )}
            {items.map((row, index) => {
              const key = `${row.id ?? "x"}-${row.dataset_id ?? ""}-${index}`;
              const json = JSON.stringify(row.raw ?? {}, null, 2);
              return (
                <tr key={key} className="odd:bg-slate-900/40 even:bg-slate-900/10 align-top">
                  <td className="px-3 py-2 text-[11px] text-slate-400">{row.id ?? "—"}</td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">{row.dataset_id ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-100 max-w-[260px] truncate" title={row.title ?? undefined}>
                    {row.title ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {row.rest_url ? (
                      <a
                        href={row.rest_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 underline-offset-2 hover:text-sky-300 hover:underline"
                      >
                        открыть
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">{row.updated_at ?? "—"}</td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">{row.inserted_at ?? "—"}</td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    <details>
                      <summary className="cursor-pointer select-none text-sky-400 hover:text-sky-300">
                        JSON
                      </summary>
                      <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-slate-950/80 p-2 text-[10px] leading-relaxed text-slate-300">
                        {json}
                      </pre>
                    </details>
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
