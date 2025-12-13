"use client";

import { useEffect, useState } from "react";
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

export default function OsdrPage() {
  const [items, setItems] = useState<OsdrItem[]>([]);
  const [src, setSrc] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/osdr?limit=20");
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

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>Источник: {src || "неизвестен"}</span>
        {loading && <span className="text-slate-300">Загрузка…</span>}
        {error && <span className="text-rose-400">{error}</span>}
      </div>
      <OsdrTable items={items} />
    </div>
  );
}
