import clsx from "clsx";

export function ModeSection({ mode, index }) {
  return (
    <section
      className={clsx(
        "relative min-h-screen snap-start",
        "flex items-center justify-center px-6 py-16 md:px-12",
        mode.bg,
      )}
      id={mode.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
    >
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.04),transparent_25%)]" />
      <div className="relative grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              Mode {index + 1}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              {mode.tag}
            </p>
            <h2 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              {mode.title}
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-white/75">
              {mode.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {mode.bullets.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-1 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur">
          <div
            className={clsx(
              "h-full w-full rounded-[22px] p-8",
              "bg-gradient-to-br",
              mode.accent,
            )}
          >
            <div className="flex h-full flex-col justify-between gap-6 text-white">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-[0.24em]">
                  Dropple
                </div>
                <div className="rounded-full bg-white/20 px-4 py-1 text-xs font-semibold">
                  Live preview
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/90">
                    {mode.title}
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Design, animate, and ship faster with Dropple.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm font-medium">
                  <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
                    Snapshot
                    <p className="text-xs text-white/80">Creative surface</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                    Export
                    <p className="text-xs text-white/80">Web • Mobile</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                    Tokens
                    <p className="text-xs text-white/80">Brand-safe</p>
                  </div>
                  <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
                    AI Assist
                    <p className="text-xs text-white/80">Built-in</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
