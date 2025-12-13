import type { UseJwstGalleryResult } from "./hooks";

type JwstGalleryProps = {
  jwst: UseJwstGalleryResult;
};

export function JwstGallery({ jwst }: JwstGalleryProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm fade-up-soft">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100">
              JWST — последние изображения
            </h2>
            <p className="text-xs text-slate-400">
              Источник {jwst.source}
            </p>
          </div>
          <div className="flex gap-2 text-xs text-slate-300">
            <select
              value={jwst.qs.source}
              onChange={(e) =>
                jwst.load({ source: e.target.value })
              }
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 transition-colors focus:border-sky-500"
            >
              <option value="jpg">Все JPG</option>
              <option value="suffix">По суффиксу</option>
              <option value="program">По программе</option>
            </select>
            {jwst.qs.source === "suffix" && (
              <input
                value={jwst.qs.suffix}
                onChange={(e) =>
                  jwst.load({ suffix: e.target.value })
                }
                placeholder="_cal / _thumb"
                className="w-32 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500"
              />
            )}
            {jwst.qs.source === "program" && (
              <input
                value={jwst.qs.program}
                onChange={(e) =>
                  jwst.load({ program: e.target.value })
                }
                placeholder="2734"
                className="w-24 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500"
              />
            )}
          </div>
        </div>
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth">
            {jwst.loading && (
              <div className="flex h-40 w-full items-center justify-center text-xs text-slate-400">
                Загрузка…
              </div>
            )}
            {!jwst.loading && !jwst.items.length && !jwst.error && (
              <div className="flex h-40 w-full items-center justify-center text-xs text-slate-500">
                Данные не найдены
              </div>
            )}
            {jwst.error && (
              <div className="flex h-40 w-full items-center justify-center text-xs text-rose-400">
                {jwst.error}
              </div>
            )}
            {jwst.items.map((item, idx) => (
              <figure
                key={idx}
                className="group relative w-44 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/80 shadow-sm shadow-slate-900/60 transition-transform duration-300 hover:-translate-y-1 hover:border-sky-500/70"
              >
                <a href={item.link || item.url} target="_blank" rel="noreferrer">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={item.url}
                      alt="JWST"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                </a>
                <figcaption className="p-2">
                  <div className="line-clamp-2 text-xs text-slate-200">
                    {item.caption || "Наблюдение JWST"}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-400">
                    {item.program && (
                      <span className="rounded-full bg-slate-800/80 px-2 py-[2px]">
                        P{item.program}
                      </span>
                    )}
                    {item.suffix && (
                      <span className="rounded-full bg-slate-800/80 px-2 py-[2px]">
                        {item.suffix}
                      </span>
                    )}
                    {item.inst?.slice(0, 2).map((i) => (
                      <span
                        key={i}
                        className="rounded-full bg-slate-800/80 px-2 py-[2px]"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
