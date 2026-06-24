"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatPct } from "../../lib/format";
import { EmptyChart } from "./RevenueLineChart";

export default function GrossMarginLine({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart title="Gross Margin Trend" />;
  }

  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-4">
      <h3 className="text-sm font-semibold text-ink mb-3">Gross Margin Trend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v) => [formatPct(v), "Gross Margin"]} contentStyle={{ borderRadius: 8, borderColor: "#E5E7EB", fontSize: 12 }} />
          <Line type="monotone" dataKey="grossMarginPct" name="Gross Margin %" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
