"use client";

import { useState } from "react";
import { formatDate } from "../lib/format";

// Lets the user pick any number of uploaded documents (2 or more) and
// renders one column per document, in the order they were selected, plus a
// period-over-period delta under each value after the first column.
export default function CompareModal({
    documents,
    onClose,
    onRunCompare,
    isComparing,
    result,
    error,
}) {
    const [selectedIds, setSelectedIds] = useState(
          documents.slice(-2).map((d) => d.id)
        );

  const toggle = (id) => {
        setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                           );
  };

  // Preserve selection order (the order checkboxes were clicked), since
  // that's the left-to-right column order in the table.
  const canRun = selectedIds.length >= 2 && !isComparing;

  return (
        <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
                <div
          className="bg-white border border-border rounded-xl shadow-card max-w-3xl w-full max-h-[85vh] overflow-y-auto p-5"
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

        <p className="text-xs text-subtle mb-2">
                          Select any number of documents (2 or more) to compare side by side, in the order you'd
                          like them shown.
                </p>

        <div className="flex flex-wrap gap-2 mb-4">
              {documents.map((d) => {
                            const checked = selectedIds.includes(d.id);
                            const order = checked ? selectedIds.indexOf(d.id) + 1 : null;
                            return (
                                            <button
                                key={d.id}
                                             onClick={() => toggle(d.id)}
                  className={`text-sm rounded-lg border px-3 py-1.5 transition-colors ${
                                      checked
                                        ? "border-accent bg-accent/10 text-accent font-medium"
                                        : "border-border text-ink hover:border-accent/40"
                  }`}
              >
{checked && <span className="mr-1.5 text-xs">{order}.</span>}
 {d.name}
 </button>
             );
})}
</div>

        <button
          disabled={!canRun}
          onClick={() => onRunCompare(selectedIds)}
          className="bg-accent text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-40 hover:bg-blue-700 transition-colors mb-4"
        >
          {isComparing ? "Comparing..." : "Run Comparison"}
</button>

{selectedIds.length === 1 && (
            <p className="text-xs text-subtle mb-3">Pick at least one more document to compare.</p>
         )}

{error && <p className="text-sm text-risk-high mb-3">{error}</p>}

 {result && (
             <div className="space-y-4">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="text-left text-xs font-semibold text-subtle uppercase tracking-wide border-b border-border">
                       <th className="py-2 pr-3">Metric</th>
  {result.docNames.map((name, i) => (
                          <th key={i} className="py-2 pr-3 whitespace-nowrap">{name}</th>
                                           ))}
  </tr>
    </thead>
                  <tbody>
  {result.metrics.map((m) => (
                        <tr key={m.key} className="border-b border-border last:border-0">
                         <td className="py-2 pr-3 font-medium text-ink whitespace-nowrap">{m.label}</td>
 {m.columns.map((col, i) => (
                           <td key={i} className="py-2 pr-3 text-ink whitespace-nowrap">
   {col.formatted}
 {col.deltaFromPrev && (
                               <span
                                className={`ml-1.5 text-xs font-medium ${
                                                                  col.deltaFromPrev.startsWith("+")
                                                                    ? "text-risk-low"
                                                                    : col.deltaFromPrev.startsWith("-")
                                                                    ? "text-risk-high"
                                                                    : "text-subtle"
                                }`}
                             >
                              ({col.deltaFromPrev})
                                </span>
                           )}
</td>
                      ))}
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
