"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCompactNumber } from "../../lib/format";

export default function RevenueLineChart({ data, currency }) {
  const [hidden, setHidden] = useState(new Set());

  if (!data || data.length === 0) {
    return <EmptyChart title="Revenue Over Time" />;
  }

  const toggle = (entry) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(entry.dataKey)) next.delete(entry.dataKey);
      else next.add(entry.dataKey);
      return next;
    });
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-4">
      <h3 className="text-sm font-semibold text-ink mb-3">Revenue Over Time</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCompactNumber(v)}
          />
          <Tooltip
            formatter={(v) => [formatCompactNumber(v) + (currency ? ` ${currency}` : ""), "Revenue"]}
            contentStyle={{ borderRadius: 8, borderColor: "#E5E7EB", fontSize: 12 }}
          />
          <Legend onClick={toggle} wrapperStyle={{ fontSize: 12, cursor: "pointer" }} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            hide={hidden.has("revenue")}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EmptyChart({ title }) {
  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-4">
      <h3 className="text-sm font-semibold text-ink mb-3">{title}</h3>
      <div className="h-[200px] flex items-center justify-center text-sm text-subtle">
        Not enough data in the uploaded document(s) to render this chart.
      </div>
    </div>
  );
}
