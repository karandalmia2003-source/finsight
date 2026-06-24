"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCompactNumber } from "../../lib/format";
import { EmptyChart } from "./RevenueLineChart";

export default function ProfitRevenueBar({ data, currency }) {
  const [hidden, setHidden] = useState(new Set());

  if (!data || data.length === 0) {
    return <EmptyChart title="Profit vs Revenue" />;
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
      <h3 className="text-sm font-semibold text-ink mb-3">Profit vs Revenue</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompactNumber(v)} />
          <Tooltip
            formatter={(v, name) => [formatCompactNumber(v) + (currency ? ` ${currency}` : ""), name]}
            contentStyle={{ borderRadius: 8, borderColor: "#E5E7EB", fontSize: 12 }}
          />
          <Legend onClick={toggle} wrapperStyle={{ fontSize: 12, cursor: "pointer" }} />
          <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} hide={hidden.has("revenue")} />
          <Bar dataKey="netIncome" name="Net Income" fill="#10B981" radius={[4, 4, 0, 0]} hide={hidden.has("netIncome")} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
