import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-[-20%] top-[-35%] h-[420px] rounded-full bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.35),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-y-0 right-[-30%] hidden w-[480px] bg-[radial-gradient(circle,rgba(236,72,153,0.35),transparent_70%)] blur-3xl lg:block" />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="text-lg font-semibold tracking-tight text-white transition hover:text-primary"
            >
              Approval Console
            </NavLink>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate-300/80">
            <span className="rounded-full border border-white/10 bg-primary/10 px-3 py-1 text-primary">
              Local Demo
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-10 sm:px-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
