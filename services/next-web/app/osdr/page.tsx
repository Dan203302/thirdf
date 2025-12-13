"use client";

import { useEffect, useMemo, useState } from "react";
import { OsdrTable } from "@/components/dashboard/OsdrTable";

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

type OsdrResponse = {
  src: string;
  items: OsdrItem[];
};

type SortBy = "id" | "dataset_id" | "title" | "updated_at" | "inserted_at";
type SortDir = "asc" | "desc";

export default function OsdrPage() {
  const [items, setItems] = useState<OsdrItem[]>([]);
  const [src, setSrc] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/osdr?limit=200");
        if (!active) return;
        const json = (await res.json()) as OsdrResponse;
        setItems(json.items || []);
        setSrc(json.src || "");
      } catch (e) {
        if (!active) return;
        setError("Ошибка загрузки OSDR");
        setItems([]);
        setSrc("");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTime = dateFrom ? Date.parse(dateFrom) : NaN;
    const toTime = dateTo ? Date.parse(dateTo) : NaN;

    let list = items.filter((it) => {
      if (q) {
        const ds = String(it.dataset_id ?? "").toLowerCase();
        const title = String(it.title ?? "").toLowerCase();
        const url = String(it.rest_url ?? "").toLowerCase();
        if (!ds.includes(q) && !title.includes(q) && !url.includes(q)) {
          return false;
        }
      }

      const dateStr = it.updated_at || it.inserted_at || null;
      if ((dateFrom || dateTo) && dateStr) {
        const t = Date.parse(dateStr);
        if (!Number.isNaN(fromTime) && !Number.isNaN(t) && t < fromTime) {
          return false;
        }
        if (!Number.isNaN(toTime) && !Number.isNaN(t) && t > toTime) {
          return false;
        }
      }

      return true;
    });

    list = [...list].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = a[sortBy];
      const bv = b[sortBy];

      if (sortBy === "id") {
        const an = typeof av === "number" ? av : Number(av ?? 0);
        const bn = typeof bv === "number" ? bv : Number(bv ?? 0);
        return (an - bn) * dir;
      }

      if (sortBy === "updated_at" || sortBy === "inserted_at") {
        const at = av ? Date.parse(String(av)) : NaN;
        const bt = bv ? Date.parse(String(bv)) : NaN;
        if (Number.isNaN(at) && Number.isNaN(bt)) return 0;
        if (Number.isNaN(at)) return -1 * dir;
        if (Number.isNaN(bt)) return 1 * dir;
        if (at === bt) return 0;
        return at > bt ? dir : -dir;
      }

      const as = String(av ?? "").toLowerCase();
      const bs = String(bv ?? "").toLowerCase();
      if (as === bs) return 0;
      return as > bs ? dir : -dir;
    });

    return list;
  }, [items, search, sortBy, sortDir, dateFrom, dateTo]);

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>Источник: {src || "неизвестен"}</span>
        {loading && <span className="text-slate-300">Загрузка…</span>}
        {error && <span className="text-rose-400">{error}</span>}
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-200">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">Поиск</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="dataset, title или URL"
            className="w-56 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">Сортировка</span>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs outline-none ring-0 focus:border-sky-500"
            >
              <option value="updated_at">по updated_at</option>
              <option value="inserted_at">по inserted_at</option>
              <option value="dataset_id">по dataset_id</option>
              <option value="title">по title</option>
              <option value="id">по id</option>
            </select>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 outline-none ring-0 transition-colors hover:border-sky-500"
            >
              {sortDir === "asc" ? "возрастание" : "убывание"}
            </button>
          </div>
        </div>
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
      </div>

      <OsdrTable items={visibleItems} />
    </div>
  );
}
