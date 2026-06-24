"use client";

import { useState } from "react";
import { formatDate } from "../lib/format";

export default function CompareModal({
  documents,
  onClose,
  onRunCompare,
  isComparing,
  result,
  error,
}) {
  const [idA, setIdA] = useState(documents[documents.length - 2]?.id || documents[0]?.id);
  const [idB, setIdB] = useState(documents[documents.length - 1]?.id || documents[1]?.id);

  const canRun = idA && idB && idA !== idB && !isComparing;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white border border-border rounded-xl shadow-card max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Compare Documents</h2>
          <button
            onClick={onClose}
            className="text-xs font-medium text-subtle hover:text-ink transition-colors"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <select
            value={idA}
            onChange={(e) => setIdA(e.target.value)}
            className="flex-1 text-sm rounded-lg border border-border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={idB}
            onChange={(e) => setIdB(e.target.value)}
            className="flex-1 text-sm rounded-lg border border-border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button
            disabled={!canRun}
            onClick={() => onRunCompare(idA, idB)}
            className="bg-accent text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-40 hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            {isComparing ? "Comparing…" : "Run Comparison"}
          </button>
        </div>

        {idA === idB && (
          <p className="text-xs text-subtle mb-3">Pick two different documents to compare.</p>
        )}

        {error && <p className="text-sm text-risk-high mb-3">{error}</p>}

        {result && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-subtle uppercase tracking-wide border-b border-border">
                    <th className="py-2 pr-3">Metric</th>
                    <th className="py-2 pr-3">{result.nameA}</th>
                    <th className="py-2 pr-3">{result.nameB}</th>
                    <th className="py-2">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {result.metrics.map((m) => (
                    <tr key={m.key} className="border-b border-border last:border-0">
                      <td className="py-2 pr-3 font-medium text-ink">{m.label}</td>
                      <td className="py-2 pr-3 text-ink">{m.valueA}</td>
                      <td className="py-2 pr-3 text-ink">{m.valueB}</td>
                      <td
                        className={`py-2 font-medium ${
                          m.rawDelta > 0
                            ? "text-risk-low"
                            : m.rawDelta < 0
                            ? "text-risk-high"
                            : "text-subtle"
                        }`}
                      >
                        {m.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-subtle uppercase tracking-wide">
                What drove the change
              </h3>
              {(result.commentary || []).map((c, i) => (
                <p key={i} className="text-sm text-ink leading-relaxed">
                  <span className="font-semibold">{c.metric}:</span> {c.note}
                </p>
              ))}
            </div>

            {result.generatedAt && (
              <p className="text-[11px] text-subtle">Generated {formatDate(result.generatedAt)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
