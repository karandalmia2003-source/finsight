// Deterministic metric-delta computation for the cross-document comparison
// feature. Deltas are computed here in plain JS (not by Claude) so the
// numbers in the table are always exactly correct; Claude is only asked to
// explain what drove each change, never to do the arithmetic.

import { formatCurrency, formatPct } from "./format";

const COMPARISON_METRICS = [
  { key: "revenue", label: "Revenue", type: "currency" },
  { key: "grossMarginPct", label: "Gross Margin", type: "pct" },
  { key: "operatingExpenses", label: "Operating Expenses", type: "currency" },
  { key: "netIncome", label: "Net Income", type: "currency" },
  { key: "yoyRevenueGrowthPct", label: "YoY Revenue Growth", type: "pct" },
];

function formatValue(type, value, currency) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return type === "currency" ? formatCurrency(value, currency) : formatPct(value);
}

export function buildComparisonMetrics(docA, docB) {
  const metricsA = docA?.extracted?.metrics || {};
  const metricsB = docB?.extracted?.metrics || {};
  const currencyA = docA?.extracted?.currency || "USD";
  const currencyB = docB?.extracted?.currency || "USD";

  return COMPARISON_METRICS.map(({ key, label, type }) => {
    const a = metricsA[key];
    const b = metricsB[key];
    let rawDelta = null;
    let deltaLabel = "—";

    if (typeof a === "number" && typeof b === "number") {
      rawDelta = b - a;
      if (type === "currency") {
        deltaLabel = `${rawDelta >= 0 ? "+" : ""}${formatCurrency(rawDelta, currencyB)}`;
      } else {
        deltaLabel = `${rawDelta >= 0 ? "+" : ""}${rawDelta.toFixed(1)}pp`;
      }
    }

    return {
      key,
      label,
      valueA: formatValue(type, a, currencyA),
      valueB: formatValue(type, b, currencyB),
      delta: deltaLabel,
      rawA: a ?? null,
      rawB: b ?? null,
      rawDelta,
    };
  });
}
