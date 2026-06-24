"use client";

const SIGNAL_STYLES = {
  beat: { color: "#10B981", label: "BEAT" },
  miss: { color: "#EF4444", label: "MISS" },
  inline: { color: "#F59E0B", label: "IN LINE" },
  unknown: { color: "#6B7280", label: "UNKNOWN" },
};

function SignalBadge({ signal }) {
  const s = SIGNAL_STYLES[signal] || SIGNAL_STYLES.unknown;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ color: s.color, backgroundColor: `${s.color}1A` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

export default function SurpriseTable({ doc, onRun, isRunning, error }) {
  const surprise = doc?.surprise;

  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Earnings Surprise</h2>
        <button
          onClick={onRun}
          disabled={isRunning}
          className="text-xs font-medium text-accent hover:underline disabled:opacity-40 flex-shrink-0"
        >
          {isRunning ? "Checking…" : surprise ? "Re-check" : "Check vs. Consensus"}
        </button>
      </div>

      {error && <p className="text-sm text-risk-high">{error}</p>}

      {!surprise && !isRunning && !error && (
        <p className="text-sm text-subtle">
          Compares reported figures against analyst consensus estimates, pulled live from the web.
        </p>
      )}

      {isRunning && !surprise && (
        <p className="text-sm text-subtle">Searching for analyst consensus…</p>
      )}

      {surprise && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-subtle uppercase tracking-wide border-b border-border">
                  <th className="py-2 pr-3">Metric</th>
                  <th className="py-2 pr-3">Reported</th>
                  <th className="py-2 pr-3">Consensus</th>
                  <th className="py-2 pr-3">Delta</th>
                  <th className="py-2">Signal</th>
                </tr>
              </thead>
              <tbody>
                {(surprise.rows || []).map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium text-ink">{r.metric}</td>
                    <td className="py-2 pr-3 text-ink">{r.reported}</td>
                    <td className="py-2 pr-3 text-ink">{r.consensus}</td>
                    <td className="py-2 pr-3 text-ink">{r.delta}</td>
                    <td className="py-2">
                      <SignalBadge signal={r.signal} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {surprise.marketContext && (
            <p className="text-sm text-subtle leading-relaxed">{surprise.marketContext}</p>
          )}
        </div>
      )}
    </div>
  );
}
