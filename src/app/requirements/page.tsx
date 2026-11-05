import Link from "next/link";
import type { Metadata } from "next";
import { REQUIREMENTS, PRIORITY_META } from "@/lib/requirements";
import { sourcesByCoverage, INGEST_METHOD_META, SOURCE_STATUS_META } from "@/lib/sources";
import { CATEGORY_META, CATEGORY_GROUPS, categoriesInGroup } from "@/types/event";

export const metadata: Metadata = {
  title: "What I need from you — Delhi NCR Events",
  description:
    "Credentials, decisions and inputs required to turn the Delhi NCR events dashboard into a live, bookable aggregator.",
};

const COST_LABEL = { free: "Free", paid: "Costs money", varies: "Varies" } as const;

export default function RequirementsPage() {
  const blockers = REQUIREMENTS.filter((r) => r.priority === "blocker");
  const high = REQUIREMENTS.filter((r) => r.priority === "high");
  const nice = REQUIREMENTS.filter((r) => r.priority === "nice");
  const sources = sourcesByCoverage();
  const connected = sources.filter((s) => s.status === "connected").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-base font-black text-white shadow">
              D
            </div>
            <div>
              <h1 className="text-base font-black leading-none text-slate-900">
                What I need from you
              </h1>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Delhi NCR Events · setup checklist
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Honest summary */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Where this actually stands</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            The dashboard is built: {Object.keys(CATEGORY_META).length} categories, filtering,
            search, calendar and timeline views, saved events, trending, insights, an assistant,
            live-refresh polling and app deep-linking all work.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            What it does <strong>not</strong> have is real data. Every event you see is sample
            content I wrote — plausible, but unconfirmed. That is why booking buttons run a search
            instead of opening a purchase page: there is no real listing to open. Nothing on this
            page is busywork; each item below removes a specific, named blocker.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: connected, l: "Sources connected", c: "text-rose-600" },
              { v: sources.length, l: "Sources mapped", c: "text-slate-700" },
              { v: blockers.length, l: "Blockers", c: "text-rose-600" },
              { v: Object.keys(CATEGORY_META).length, l: "Categories ready", c: "text-indigo-600" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
                <div className="text-[10px] font-semibold leading-tight text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements */}
        {[
          { title: "Do these first", items: blockers, note: "Nothing is live until these are done." },
          { title: "Biggest wins next", items: high, note: "Each one meaningfully widens coverage." },
          { title: "Optional", items: nice, note: "Safe to ignore." },
        ].map((group) => (
          <section key={group.title} className="mb-8">
            <div className="mb-3 flex items-baseline gap-3">
              <h2 className="text-lg font-black text-slate-900">{group.title}</h2>
              <span className="text-xs text-slate-500">{group.note}</span>
            </div>
            <div className="space-y-3">
              {group.items.map((req) => {
                const p = PRIORITY_META[req.priority];
                return (
                  <article
                    key={req.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-sm font-black text-slate-900">{req.title}</h3>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${p.bg} ${p.color} ${p.border}`}>
                          {p.label}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          ⏱ {req.effort}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            req.cost === "free"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {COST_LABEL[req.cost]}
                        </span>
                      </div>
                    </div>

                    <ol className="mt-3 space-y-1.5">
                      {req.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-black text-indigo-700">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>

                    {req.secret && (
                      <p className="mt-3 text-[11px] text-slate-500">
                        Secret name:{" "}
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                          {req.secret}
                        </code>
                      </p>
                    )}

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-green-100 bg-green-50 p-2.5">
                        <div className="text-[9px] font-black uppercase tracking-wider text-green-700">
                          Unlocks
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-green-900">{req.unlocks}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                        <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                          If you skip it
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{req.ifSkipped}</p>
                      </div>
                    </div>

                    {req.link && (
                      <a
                        href={req.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                      >
                        {req.linkLabel ?? "Open"} ↗
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {/* Source map */}
        <section className="mb-8">
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="text-lg font-black text-slate-900">Every source, and what it needs</h2>
            <span className="text-xs text-slate-500">Ordered by how much coverage it adds.</span>
          </div>
          <div className="space-y-2.5">
            {sources.map((s) => {
              const m = INGEST_METHOD_META[s.method];
              const st = SOURCE_STATUS_META[s.status];
              return (
                <article key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">{s.name}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${st.bg} ${st.color} ${st.border}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                        <span
                          title={m.detail}
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${m.bg} ${m.color} ${m.border}`}
                        >
                          {m.label}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          {s.coverage} coverage
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{s.blurb}</p>
                      {s.blocker && (
                        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                          <strong className="text-slate-600">Blocker:</strong> {s.blocker}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.covers.map((c) => (
                          <span
                            key={c}
                            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${CATEGORY_META[c].bg} ${CATEGORY_META[c].color}`}
                          >
                            {CATEGORY_META[c].icon} {CATEGORY_META[c].label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <a
                      href={s.signupUrl ?? s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
                    >
                      {s.signupUrl ? "Get access ↗" : "Visit ↗"}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">
            The {Object.keys(CATEGORY_META).length} categories, ready to fill
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Tell me which of these you care about and I will tune the dashboard around them.
          </p>
          <div className="mt-4 space-y-4">
            {CATEGORY_GROUPS.map((group) => {
              const cats = categoriesInGroup(group);
              if (cats.length === 0) return null;
              return (
                <div key={group}>
                  <h3 className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {group}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cats.map((c) => {
                      const meta = CATEGORY_META[c];
                      return (
                        <span
                          key={c}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.bg} ${meta.color} ${meta.border}`}
                        >
                          {meta.icon} {meta.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="pb-4 text-center text-xs text-slate-400">
          <Link href="/" className="font-semibold text-indigo-600 hover:underline">
            ← Back to the dashboard
          </Link>
        </footer>
      </main>
    </div>
  );
}
