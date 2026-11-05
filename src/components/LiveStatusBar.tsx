"use client";
import { EventChange } from "@/hooks/useLiveEvents";
import { PermissionState, describeChange } from "@/hooks/useNotifications";

const KIND_META: Record<
  EventChange["kind"],
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  "sold-out": { label: "Sold out", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: "🚫" },
  status: { label: "Status", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: "🔄" },
  price: { label: "Price", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: "💰" },
  new: { label: "New", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", icon: "✨" },
};

function relative(ts: number): string {
  const secs = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export default function LiveStatusBar({
  checking,
  lastChecked,
  error,
  changes,
  permission,
  onEnableAlerts,
  onRefresh,
  onDismiss,
  liveSourceConnected,
}: {
  checking: boolean;
  lastChecked: number | null;
  error: string | null;
  changes: EventChange[];
  permission: PermissionState;
  onEnableAlerts: () => void;
  onRefresh: () => void;
  onDismiss: () => void;
  liveSourceConnected: boolean;
}) {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              checking ? "animate-pulse bg-amber-500" : liveSourceConnected ? "bg-green-500" : "bg-slate-300"
            }`}
          />
          <div>
            <p className="text-sm font-black text-slate-800">
              {checking ? "Checking for updates…" : liveSourceConnected ? "Live monitoring on" : "Live monitoring idle"}
            </p>
            <p className="text-[11px] text-slate-500">
              {error
                ? `Last check failed: ${error}`
                : lastChecked
                  ? `Last checked ${relative(lastChecked)} · re-checks every 5 min while this tab is open`
                  : liveSourceConnected
                    ? "Watching for sold-out and price changes"
                    : "No live feed connected yet — connect a source to monitor ticket status"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={checking}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50"
          >
            {checking ? "Checking…" : "↻ Check now"}
          </button>

          {permission === "granted" ? (
            <span className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
              🔔 Alerts on
            </span>
          ) : permission === "denied" ? (
            <span
              title="Re-enable notifications for this site in your browser's site settings."
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500"
            >
              🔕 Alerts blocked
            </span>
          ) : permission === "unsupported" ? (
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-400">
              Alerts unsupported
            </span>
          ) : (
            <button
              onClick={onEnableAlerts}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
            >
              🔔 Enable alerts
            </button>
          )}
        </div>
      </div>

      {changes.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Recent changes ({changes.length})
            </h3>
            <button
              onClick={onDismiss}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          </div>
          <ul className="max-h-40 space-y-1.5 overflow-y-auto">
            {changes.slice(0, 12).map((c, i) => {
              const meta = KIND_META[c.kind];
              const { body } = describeChange(c);
              return (
                <li
                  key={`${c.eventId}-${c.at}-${i}`}
                  className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 ${meta.bg} ${meta.border}`}
                >
                  <span className="text-xs">{meta.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`text-[11px] font-bold ${meta.color}`}>{meta.label}</span>
                    <span className="block truncate text-[11px] text-slate-600">{body}</span>
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-400">{relative(c.at)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
