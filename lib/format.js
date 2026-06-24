export function formatCurrency(value, currency = "USD") {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return `$${Number(value).toLocaleString()}`;
  }
}

export function formatCompactNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPct(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const { signed = false } = opts;
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
