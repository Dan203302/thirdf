"use client";

import type { ReactNode } from "react";
import type { JwstItem } from "./hooks";

type Props = {
  item: JwstItem | null;
  loading: boolean;
  error: string | null;
};

export function JwstFeatured({ item, loading, error }: Props) {
  let body: ReactNode;
  if (loading && !item) {
    body = <p className="text-xs text-slate-400">Загрузка наблюдения…</p>;
  } else if (error) {
    body = (
      <p className="text-xs text-rose-400">
        Не удалось загрузить данные JWST
      </p>
    );
  } else if (!item) {
    body = (
      <p className="text-xs text-slate-400">Нет данных по текущему наблюдению.</p>
    );
  } else {
    const instruments = (item.inst || []).join(" / ");
    body = (
      <div className="space-y-3 text-xs text-slate-200">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="md:w-40 md:flex-none overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/60">
            <img
              src={item.url}
              alt={item.caption || "JWST"}
              className="h-32 w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="space-y-1">
            <div className="text-[13px] font-medium text-slate-100 line-clamp-2">
              {item.caption || "Наблюдение JWST"}
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              {item.program && (
                <div>
                  Программа: <span className="text-slate-200">{item.program}</span>
                </div>
              )}
              {item.suffix && (
                <div>
                  Суффикс: <span className="text-slate-200">{item.suffix}</span>
                </div>
              )}
              {instruments && (
                <div>
                  Инструменты: <span className="text-slate-200">{instruments}</span>
                </div>
              )}
            </div>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
              >
                Открыть источник
              </a>
            )}
          </div>
        </div>
        <details className="text-[11px] text-slate-400">
          <summary className="cursor-pointer select-none text-[11px] uppercase tracking-wide text-slate-500">
            Полный JSON
          </summary>
          <pre className="mt-2 max-h-52 overflow-auto rounded-lg bg-slate-950/80 p-2 text-[10px] leading-relaxed text-slate-200">
            {JSON.stringify(item, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-100">
          JWST — выбранное наблюдение
        </h2>
      </div>
      {body}
    </div>
  );
}
