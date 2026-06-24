// Deterministic metric-delta computation for the cross-document comparison
// feature. Deltas are computed here in plain JS (not by Claude) so the
// numbers in the table are always exactly correct; Claude is only asked to
// explain what drove each change, never to do the arithmetic. Generalized
// to any number of documents (2 or more) -- each metric row gets one column
// per selected document, plus a delta versus the previous column so a
// multi-period trend is still easy to read at a glance.

import { formatCurrency, formatPct } from "./format";

const COMPARISON_METRICS = [
  { key: "revenue", label: "Revenue", type: "currency" },
  { key: "grossMarginPct", label: "Gross Margin", type: "pct" },
  { key: "operatingExpenses", label: "Operating Expenses", type: "currency" },
  { key: "netIncome", label: "Net Income", type: "currency" },
  { key: "yoyRevenueGrowthPct", label: "YoY Revenue Growth", type: "pct" },
  ];

function formatValue(type, value, currency) {
    if (value === null || value === undefined || Number.isNaN(value)) return "--";
    return type === "currency" ? formatCurrency(value, currency) : formatPct(value);
}

function formatDelta(type, rawDelta, currency) {
    if (rawDelta === null || rawDelta === undefined || Number.isNaN(rawDelta)) return null;
    const sign = rawDelta >= 0 ? "+" : "";
    return type === "currency"
      ? `${sign}${formatCurrency(rawDelta, currency)}`
          : `${sign}${rawDelta.toFixed(1)}pp`;
}

export function buildComparisonMetrics(docs) {
    return COMPARISON_METRICS.map(({ key, label, type }) => {
          const columns = docs.map((doc, i) => {
                  const raw = doc?.extracted?.metrics?.[key];
                  const value = typeof raw === "number" ? raw : null;
                  const currency = doc?.extracted?.currency || "USD";

                  let deltaFromPrev = null;
                  if (i > 0 && value !== null) {
                            const prevValue = docs[i - 1]?.extracted?.metrics?.[key];
                            if (typeof prevValue === "number") {
                                        deltaFromPrev = formatDelta(type, value - prevValue, currency);
                            }
                  }

                  return {
                            docId: doc.id,
                            docName: doc.name,
                            raw: value,
                            formatted: formatValue(type, value, currency),
                            deltaFromPrev,
                  };
          });

          return { key, label, type, columns };
    });
}

