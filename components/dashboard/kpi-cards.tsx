"use client"

import {
  Users,
  UserMinus,
  TrendingDown,
  Wallet,
  Clock,
  Smile,
  CalendarClock,
  Timer,
} from "lucide-react"
import type { Kpis } from "@/lib/data"
import { fmtInt, fmtPct, fmtMoneyShort } from "@/lib/utils"
import { Card } from "@/components/ui/primitives"

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const items = [
    {
      label: "Headcount",
      value: fmtInt(kpis.headcount),
      icon: Users,
      tone: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Attrition Count",
      value: fmtInt(kpis.attrition),
      icon: UserMinus,
      tone: "text-danger",
      bg: "bg-danger/10",
    },
    {
      label: "Attrition Rate",
      value: fmtPct(kpis.attritionRate),
      icon: TrendingDown,
      tone: "text-danger",
      bg: "bg-danger/10",
    },
    {
      label: "Avg Salary",
      value: fmtMoneyShort(kpis.avgSalary),
      icon: Wallet,
      tone: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Avg Tenure",
      value: `${kpis.avgTenure.toFixed(1)} yrs`,
      icon: CalendarClock,
      tone: "text-foreground",
      bg: "bg-muted",
    },
    {
      label: "Avg Satisfaction",
      value: `${kpis.avgSatisfaction.toFixed(2)} / 5`,
      icon: Smile,
      tone: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Avg Age",
      value: `${kpis.avgAge.toFixed(1)}`,
      icon: Clock,
      tone: "text-foreground",
      bg: "bg-muted",
    },
    {
      label: "Overtime Share",
      value: fmtPct(kpis.overtimeShare),
      icon: Timer,
      tone: "text-warning",
      bg: "bg-warning/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((it, i) => {
        const Icon = it.icon
        return (
          <Card key={it.label} className="animate-in p-4" >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">{it.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${it.bg} ${it.tone}`}>
                <Icon style={{ width: 16, height: 16 }} />
              </span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-foreground">
              {it.value}
            </p>
          </Card>
        )
      })}
    </div>
  )
}
