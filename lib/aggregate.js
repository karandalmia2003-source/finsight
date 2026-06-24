// Helpers that turn the per-document extracted JSON into chart-ready arrays.

export function sortByPeriod(arr, key = "periodSortKey") {
  return [...arr].sort((a, b) => {
    if (a[key] > b[key]) return 1;
    if (a[key] < b[key]) return -1;
    return 0;
  });
}

// Unified revenue-over-time series: merges each document's own historical
// revenue mentions with every document's headline revenue figure, de-duped
// by period key, so the chart is meaningful for a single filing (which often
// quotes prior quarters/years) as well as across many uploaded filings.
export function buildRevenueSeries(documents) {
  const map = new Map();
  documents.forEach((doc) => {
    const ex = doc.extracted;
    if (!ex) return;
    (ex.revenueHistory || []).forEach((h) => {
      if (h.periodSortKey && h.revenue != null && !map.has(h.periodSortKey)) {
        map.set(h.periodSortKey, {
          period: h.period,
          periodSortKey: h.periodSortKey,
          revenue: h.revenue,
        });
      }
    });
    if (ex.periodSortKey && ex.metrics?.revenue != null) {
      map.set(ex.periodSortKey, {
        period: ex.period,
        periodSortKey: ex.periodSortKey,
        revenue: ex.metrics.revenue,
      });
    }
  });
  return sortByPeriod(Array.from(map.values()));
}

export function buildProfitRevenueData(documents) {
  return sortByPeriod(
    documents
      .filter((d) => d.extracted)
      .map((d) => ({
        period: d.extracted.period,
        periodSortKey: d.extracted.periodSortKey,
        revenue: d.extracted.metrics?.revenue ?? null,
        netIncome: d.extracted.metrics?.netIncome ?? null,
      }))
      .filter((d) => d.revenue != null || d.netIncome != null)
  );
}

export function buildGrossMarginData(documents) {
  return sortByPeriod(
    documents
      .filter((d) => d.extracted?.metrics?.grossMarginPct != null)
      .map((d) => ({
        period: d.extracted.period,
        periodSortKey: d.extracted.periodSortKey,
        grossMarginPct: d.extracted.metrics.grossMarginPct,
      }))
  );
}

export function buildYoYData(documents) {
  return sortByPeriod(
    documents
      .filter((d) => d.extracted?.metrics?.yoyRevenueGrowthPct != null)
      .map((d) => ({
        period: d.extracted.period,
        periodSortKey: d.extracted.periodSortKey,
        yoyRevenueGrowthPct: d.extracted.metrics.yoyRevenueGrowthPct,
      }))
  );
}

export function buildExpenseData(doc) {
  if (!doc?.extracted?.expenseBreakdown) return [];
  return doc.extracted.expenseBreakdown
    .filter((e) => e.amount != null)
    .map((e) => ({ name: e.category, value: e.amount }));
}
