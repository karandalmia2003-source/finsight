"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { formatPct } from "../../lib/format";
import { EmptyChart } from "./RevenueLineChart";

export default function YoYBarChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart title="YoY Revenue Growth" />;
  }

  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-4">
      <h3 className="text-sm font-semibold text-ink mb-3">YoY Revenue Growth</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v) => [formatPct(v, { signed: true }), "YoY Growth"]} contentStyle={{ borderRadius: 8, borderColor: "#E5E7EB", fontSize: 12 }} />
          <Bar dataKey="yoyRevenueGrowthPct" name="YoY Growth %" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.yoyRevenueGrowthPct >= 0 ? "#10B981" : "#EF4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
