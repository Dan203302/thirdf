"use client";

import { IssTrendTable } from "@/components/dashboard/IssTrendTable";
import { useIssTelemetry } from "@/components/dashboard/hooks";

export default function IssPage() {
  const { trend, loading } = useIssTelemetry();
  const points = trend?.points ?? [];

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>ISS telemetry · тренд</span>
        {loading && <span className="text-slate-300">Загрузка…</span>}
        {!loading && !points.length && (
          <span className="text-slate-500">нет данных</span>
        )}
      </div>
      <IssTrendTable points={points} />
    </div>
  );
}
