import { useEffect, useMemo, useState } from "react";

export type IssPoint = {
  at: string;
  lat: number;
  lon: number;
  velocity: number;
  altitude: number;
};

export type IssTrendResponse = {
  points: IssPoint[];
};

export type IssLastResponse = {
  payload?: {
    latitude?: number;
    longitude?: number;
    velocity?: number;
    altitude?: number;
  };
};

export type JwstItem = {
  url: string;
  link?: string;
  caption?: string;
  program?: string;
  suffix?: string;
  inst?: string[];
};

export type JwstResponse = {
  source: string;
  count: number;
  items: JwstItem[];
};

export type AstroRow = {
  name: string;
  type: string;
  when: string;
  extra: string;
};

export type JwstQuery = {
  source: string;
  suffix: string;
  program: string;
  instrument: string;
  perPage: string;
};

export type UseJwstGalleryResult = {
  items: JwstItem[];
  source: string;
  loading: boolean;
  error: string | null;
  qs: JwstQuery;
  load: (nextQs?: Partial<JwstQuery>) => void;
};

export type AstroQuery = {
  lat: string;
  lon: string;
  days: string;
};

export type UseAstroEventsResult = {
  rows: AstroRow[];
  raw: string;
  loading: boolean;
  error: string | null;
  load: (next?: Partial<AstroQuery>) => void;
  query: AstroQuery;
};

export function useIssTelemetry() {
  const [last, setLast] = useState<IssLastResponse | null>(null);
  const [trend, setTrend] = useState<IssTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [lastRes, trendRes] = await Promise.all([
          fetch("/api/iss/last"),
          fetch("/api/iss/trend?limit=240"),
        ]);
        if (!active) return;
        const lastJson = (await lastRes.json()) as IssLastResponse;
        const trendJson = (await trendRes.json()) as IssTrendResponse;
        setLast(lastJson);
        setTrend(trendJson);
      } catch (e) {
        if (!active) return;
        setLast(null);
        setTrend(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const metrics = useMemo(() => {
    const v = last?.payload?.velocity ?? null;
    const h = last?.payload?.altitude ?? null;
    return { velocity: v, altitude: h };
  }, [last]);

  return { last, trend, loading, metrics };
}

export function useJwstGallery(initialSource = "jpg"): UseJwstGalleryResult {
  const [items, setItems] = useState<JwstItem[]>([]);
  const [source, setSource] = useState(initialSource);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qs, setQs] = useState<JwstQuery>({
    source: initialSource,
    suffix: "",
    program: "",
    instrument: "",
    perPage: "24",
  });

  async function load(nextQs?: Partial<JwstQuery>) {
    const merged = { ...qs, ...nextQs };
    setQs(merged);
    try {
      setLoading(true);
      setError(null);
      const url = "/api/jwst/feed?" + new URLSearchParams(merged).toString();
      const res = await fetch(url);
      const json = (await res.json()) as JwstResponse;
      setItems(json.items || []);
      setSource(json.source || merged.source);
    } catch (e) {
      setError("Ошибка загрузки галереи");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { items, source, loading, error, qs, load };
}

function normalizeAstroNode(node: any): AstroRow | null {
  if (!node || typeof node !== "object") return null;
  const name =
    node.name ||
    node.body ||
    node.object ||
    node.target ||
    "";
  const type =
    node.type ||
    node.event_type ||
    node.category ||
    node.kind ||
    "";
  const when =
    node.time ||
    node.date ||
    node.occursAt ||
    node.peak ||
    node.instant ||
    "";
  const extra =
    node.magnitude ||
    node.mag ||
    node.altitude ||
    node.note ||
    "";
  if (!name && !type && !when) return null;
  return {
    name: String(name || ""),
    type: String(type || ""),
    when: String(when || ""),
    extra: String(extra || ""),
  };
}

function collectAstroRows(root: any): AstroRow[] {
  const rows: AstroRow[] = [];

  function dfs(x: any) {
    if (!x || typeof x !== "object") return;
    if (Array.isArray(x)) {
      x.forEach(dfs);
      return;
    }
    const row = normalizeAstroNode(x);
    if (row) rows.push(row);
    Object.values(x).forEach(dfs);
  }

  dfs(root);
  return rows;
}

export function useAstroEvents(): UseAstroEventsResult {
  const [rows, setRows] = useState<AstroRow[]>([]);
  const [raw, setRaw] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<AstroQuery>({
    lat: "55.7558",
    lon: "37.6176",
    days: "7",
  });

  async function load(next?: Partial<AstroQuery>) {
    const merged = { ...query, ...next };
    setQuery(merged);
    try {
      setLoading(true);
      setError(null);
      const url = "/api/astro/events?" + new URLSearchParams(merged).toString();
      const res = await fetch(url);
      const json = await res.json();
      setRaw(JSON.stringify(json, null, 2));
      const data = collectAstroRows(json).slice(0, 200);
      setRows(data);
    } catch (e) {
      setError("Ошибка загрузки событий");
      setRows([]);
      setRaw("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { rows, raw, loading, error, load, query };
}
