export function SiteHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 shadow-lg shadow-sky-900/60 animate-pulse-slow" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-400">
              Cassiopeia
            </span>
            <span className="text-[11px] text-slate-500">
              ISS · JWST · OSDR
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm text-slate-300">
          <a
            href="/"
            className="rounded-full px-3 py-1 transition-colors hover:bg-slate-800/80 hover:text-slate-50"
          >
            Dashboard
          </a>
          <a
            href="/osdr"
            className="rounded-full px-3 py-1 transition-colors hover:bg-slate-800/80 hover:text-slate-50"
          >
            OSDR
          </a>
        </nav>
      </div>
    </header>
  );
}
