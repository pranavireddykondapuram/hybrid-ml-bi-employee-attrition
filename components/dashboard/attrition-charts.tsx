"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
} from "recharts"
import type { Employee } from "@/lib/types"
import { groupBy, ageBand } from "@/lib/data"
import { Card, CardHeader } from "@/components/ui/primitives"

const COLORS = {
  primary: "oklch(0.74 0.13 190)",
  danger: "oklch(0.65 0.2 20)",
  accent: "oklch(0.8 0.14 80)",
  success: "oklch(0.74 0.14 160)",
  grid: "oklch(0.3 0.015 252)",
  text: "oklch(0.68 0.012 252)",
}

const PIE_PALETTE = [
  "oklch(0.74 0.13 190)",
  "oklch(0.65 0.2 20)",
  "oklch(0.8 0.14 80)",
  "oklch(0.74 0.14 160)",
  "oklch(0.6 0.13 290)",
  "oklch(0.7 0.12 40)",
]

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? p.fill }}>
          {p.name}: <span className="font-mono">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function AttritionByDept({ data }: { data: Employee[] }) {
  const stats = groupBy(data, (e) => e.dept ?? "Unknown").map((s) => ({
    name: s.key,
    Attrition: +(s.rate * 100).toFixed(1),
    Left: s.left,
  }))
  return (
    <Card className="animate-in">
      <CardHeader title="Attrition Rate by Department" subtitle="Share of employees who left, per department" />
      <div className="h-72 px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats} margin={{ top: 4, right: 12, bottom: 4, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: COLORS.text, fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis tick={{ fill: COLORS.text, fontSize: 11 }} unit="%" />
            <Tooltip content={<ChartTip />} cursor={{ fill: "oklch(0.26 0.015 252 / 0.4)" }} />
            <Bar dataKey="Attrition" radius={[4, 4, 0, 0]} unit="%">
              {stats.map((s, i) => (
                <Cell key={i} fill={s.Attrition >= 40 ? COLORS.danger : COLORS.primary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function AttritionByWorkmode({ data }: { data: Employee[] }) {
  const stats = groupBy(data, (e) => e.workmode ?? "Unknown").map((s, i) => ({
    name: s.key,
    value: s.left,
    total: s.total,
    color: PIE_PALETTE[i % PIE_PALETTE.length],
  }))
  return (
    <Card className="animate-in">
      <CardHeader title="Attrition by Work Mode" subtitle="Where leavers were working from" />
      <div className="h-72 px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {stats.map((s, i) => (
                <Cell key={i} fill={s.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<ChartTip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: COLORS.text }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function AttritionByAge({ data }: { data: Employee[] }) {
  const order = ["Under 30", "30-39", "40-49", "50+", "Unknown"]
  const stats = groupBy(data, (e) => ageBand(e.age))
    .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
    .map((s) => ({
      name: s.key,
      Rate: +(s.rate * 100).toFixed(1),
      Headcount: s.total,
    }))
  return (
    <Card className="animate-in">
      <CardHeader title="Attrition Rate by Age Band" subtitle="Risk concentration across career stages" />
      <div className="h-72 px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats} margin={{ top: 8, right: 16, bottom: 4, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: COLORS.text, fontSize: 11 }} />
            <YAxis tick={{ fill: COLORS.text, fontSize: 11 }} unit="%" />
            <Tooltip content={<ChartTip />} />
            <Line
              type="monotone"
              dataKey="Rate"
              stroke={COLORS.accent}
              strokeWidth={2.5}
              unit="%"
              dot={{ r: 4, fill: COLORS.accent }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function AttritionBySatisfaction({ data }: { data: Employee[] }) {
  const stats = groupBy(data, (e) =>
    e.satisfaction != null ? String(e.satisfaction) : "Unknown",
  )
    .filter((s) => s.key !== "Unknown")
    .sort((a, b) => Number(a.key) - Number(b.key))
    .map((s) => ({
      name: `Score ${s.key}`,
      Rate: +(s.rate * 100).toFixed(1),
    }))
  return (
    <Card className="animate-in">
      <CardHeader title="Attrition by Satisfaction Score" subtitle="Lower satisfaction, higher flight risk" />
      <div className="h-72 px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats} margin={{ top: 4, right: 12, bottom: 4, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: COLORS.text, fontSize: 11 }} />
            <YAxis tick={{ fill: COLORS.text, fontSize: 11 }} unit="%" />
            <Tooltip content={<ChartTip />} cursor={{ fill: "oklch(0.26 0.015 252 / 0.4)" }} />
            <Bar dataKey="Rate" radius={[4, 4, 0, 0]} unit="%">
              {stats.map((s, i) => (
                <Cell key={i} fill={s.Rate >= 40 ? COLORS.danger : COLORS.success} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function OvertimeImpact({ data }: { data: Employee[] }) {
  const stats = groupBy(data, (e) => e.overtime ?? "Unknown")
    .filter((s) => s.key !== "Unknown")
    .map((s) => ({
      name: s.key === "Yes" ? "Works Overtime" : "No Overtime",
      Rate: +(s.rate * 100).toFixed(1),
    }))
  return (
    <Card className="animate-in">
      <CardHeader title="Overtime vs Attrition" subtitle="Overtime is a leading churn driver" />
      <div className="h-72 px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
            <XAxis type="number" tick={{ fill: COLORS.text, fontSize: 11 }} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fill: COLORS.text, fontSize: 12 }} width={110} />
            <Tooltip content={<ChartTip />} cursor={{ fill: "oklch(0.26 0.015 252 / 0.4)" }} />
            <Bar dataKey="Rate" radius={[0, 4, 4, 0]} unit="%">
              {stats.map((s, i) => (
                <Cell key={i} fill={s.name === "Works Overtime" ? COLORS.danger : COLORS.primary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
