"use client";

import { useState } from "react";
import { formatDate } from "../lib/format";

export default function StressTest({ doc, onRun, isRunning, error }) {
  const [assumption, setAssumption] = useState("");
  const history = doc?.stressTests || [];

  const submit = () => {
    const text = assumption.trim();
    if (!text || isRunning) return;
    onRun(text);
    setAssumption("");
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Stress Test</h2>
        {doc?.name && <span className="text-xs text-subtle truncate max-w-[50%]">{doc.name}</span>}
      </div>

      <p className="text-sm text-subtle leading-relaxed">
        Type a "what if" assumption and Claude will reason through the bottom-line impact using
        this document's actual figures — e.g. "what if gross margin drops 300bps" or "revenue
        grows 10% slower than projected."
      </p>

      <div className="flex items-center gap-2">
        <input
          value={assumption}
          onChange={(e) => setAssumption(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="What if revenue grows 10% slower than projected…"
          disabled={isRunning}
          className="flex-1 text-sm rounded-lg border border-border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
        />
        <button
          onClick={submit}
          disabled={isRunning || !assumption.trim()}
          className="bg-accent text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-40 hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          {isRunning ? "Testing…" : "Run"}
        </button>
      </div>

      {error && <p className="text-sm text-risk-high">{error}</p>}

      {history.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          {[...history].reverse().map((t) => (
            <div key={t.id} className="bg-surface border border-border rounded-lg p-3 space-y-1.5">
              <p className="text-sm font-medium text-ink leading-relaxed">
                {t.result.assumptionRestated}
              </p>
              {t.result.affectedMetrics?.length > 0 && (
                <p className="text-xs text-subtle">
                  <span className="font-semibold">Affected:</span>{" "}
                  {t.result.affectedMetrics.join(", ")}
                </p>
              )}
              <p className="text-sm text-ink leading-relaxed">{t.result.estimatedImpact}</p>
              <p className="text-xs font-medium text-accent">{t.result.materiality}</p>
              <p className="text-[11px] text-subtle">{formatDate(t.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
