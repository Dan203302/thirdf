"use client";

import { useEffect, useRef } from "react";

export function IssOrbitPanel() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const speedRef = useRef<HTMLCanvasElement | null>(null);
  const altRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function init() {
      if (!mapRef.current || !speedRef.current || !altRef.current) return;
      const win = window as any;
      const L = win.L;
      const Chart = win.Chart;
      if (!L || !Chart) return;

      let lat0 = 0;
      let lon0 = 0;
      try {
        const resLast = await fetch("/api/iss/last");
        const jsLast = await resLast.json();
        const payload = (jsLast && jsLast.payload) || {};
        lat0 = Number(payload.latitude || 0);
        lon0 = Number(payload.longitude || 0);
      } catch {
      }
      if (cancelled || !mapRef.current || !speedRef.current || !altRef.current) return;

      const map = L.map(mapRef.current, { attributionControl: false }).setView(
        [lat0 || 0, lon0 || 0],
        lat0 ? 3 : 2
      );
      let tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
        { noWrap: true }
      ).addTo(map);
      const trail = L.polyline([], { weight: 3 }).addTo(map);
      const marker = L.marker([lat0 || 0, lon0 || 0]).addTo(map).bindPopup("МКС");

      const speedChart = new Chart(speedRef.current, {
        type: "line",
        data: { labels: [], datasets: [{ label: "Скорость", data: [] }] },
        options: { responsive: true, scales: { x: { display: false } } },
      });
      const altChart = new Chart(altRef.current, {
        type: "line",
        data: { labels: [], datasets: [{ label: "Высота", data: [] }] },
        options: { responsive: true, scales: { x: { display: false } } },
      });

      async function loadTrend() {
        try {
          const r = await fetch("/api/iss/trend?limit=240");
          const js = await r.json();
          const pts = Array.isArray(js.points)
            ? js.points.map((p: any) => [p.lat, p.lon])
            : [];
          if (pts.length) {
            trail.setLatLngs(pts);
            marker.setLatLng(pts[pts.length - 1]);
          }
          const labels = (js.points || []).map((p: any) =>
            new Date(p.at).toLocaleTimeString()
          );
          speedChart.data.labels = labels;
          speedChart.data.datasets[0].data = (js.points || []).map(
            (p: any) => p.velocity
          );
          speedChart.update();
          altChart.data.labels = labels;
          altChart.data.datasets[0].data = (js.points || []).map(
            (p: any) => p.altitude
          );
          altChart.update();
        } catch {
        }
      }

      await loadTrend();
      const id = window.setInterval(loadTrend, 15000);


      tileLayer.on("tileerror", () => {
        try {
          map.removeLayer(tileLayer);
        } catch {}
        tileLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          { attribution: "" }
        );
        tileLayer.addTo(map);
      });

      cleanup = () => {
        window.clearInterval(id);
        try {
          speedChart.destroy();
          altChart.destroy();
        } catch {}
        try {
          map.remove();
        } catch {}
      };
    }

    init();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">Leaflet + Chart.js</span>
      </div>
      <div className="mb-3 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/40">
        <div ref={mapRef} className="h-72 w-full" id="map" />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <canvas ref={speedRef} height={110} />
        </div>
        <div>
          <canvas ref={altRef} height={110} />
        </div>
      </div>
    </div>
  );
}
