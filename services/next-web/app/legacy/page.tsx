"use client";

import { useMemo, useState } from "react";
import { LegacyTable } from "@/components/dashboard/LegacyTable";
import { useLegacyTelemetry, type LegacyRow } from "@/components/dashboard/hooks";

type OkFilter = "all" | "ok" | "bad";

export default function LegacyPage() {
  const { rows, loading, error, reload } = useLegacyTelemetry();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [okFilter, setOkFilter] = useState<OkFilter>("all");

  const visibleRows = useMemo(() => {
    const fromTime = dateFrom ? Date.parse(dateFrom) : NaN;
    const toTime = dateTo ? Date.parse(dateTo) : NaN;

    return rows.filter((row: LegacyRow) => {
      if (dateFrom || dateTo) {
        const t = Date.parse(row.recorded_at);
        if (!Number.isNaN(fromTime) && !Number.isNaN(t) && t < fromTime) {
          return false;
        }
        if (!Number.isNaN(toTime) && !Number.isNaN(t) && t > toTime) {
          return false;
        }
      }

      if (okFilter === "ok" && !row.is_ok) {
        return false;
      }
      if (okFilter === "bad" && row.is_ok) {
        return false;
      }

      return true;
    });
  }, [rows, dateFrom, dateTo, okFilter]);

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    if (dateFrom) {
      params.set("from", dateFrom);
    }
    if (dateTo) {
      params.set("to", dateTo);
    }
    if (okFilter === "ok") {
      params.set("ok", "true");
    }
    if (okFilter === "bad") {
      params.set("ok", "false");
    }
    const qs = params.toString();
    return "/api/legacy/xlsx" + (qs ? "?" + qs : "");
  }, [dateFrom, dateTo, okFilter]);

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>Legacy telemetry · Pascal CSV</span>
        <div className="flex items-center gap-3">
          {loading && <span className="text-slate-300">Загрузка…</span>}
          {!loading && !!rows.length && (
            <span className="text-slate-500">
              записей: {rows.length}
            </span>
          )}
          {error && <span className="text-rose-400">{error}</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-200">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">Дата от</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 focus:border-sky-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">Дата до</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 focus:border-sky-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">Статус</span>
          <select
            value={okFilter}
            onChange={(e) => setOkFilter(e.target.value as OkFilter)}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 focus:border-sky-500"
          >
            <option value="all">все</option>
            <option value="ok">только ok</option>
            <option value="bad">только alarm</option>
          </select>
        </div>
        <div className="flex flex-1 justify-end gap-2">
          <button
            type="button"
            onClick={reload}
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1 text-xs font-medium text-slate-100 outline-none ring-0 transition-colors hover:border-sky-500"
          >
            Обновить
          </button>
          <a
            href={exportHref}
            className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-medium text-slate-950 shadow-sm shadow-emerald-900/40 transition-colors hover:bg-emerald-400"
          >
            Экспорт .xlsx
          </a>
        </div>
      </div>

      <LegacyTable rows={visibleRows} />
    </div>
  );
}
