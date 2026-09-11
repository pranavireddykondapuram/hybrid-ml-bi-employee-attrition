"use client"

import type { Employee } from "@/lib/types"
import { ageBand } from "@/lib/data"
import { Card, CardHeader } from "@/components/ui/primitives"

const AGE_BANDS = ["Under 30", "30-39", "40-49", "50+"]

function heatColor(rate: number): string {
  // teal (low) -> amber -> rose (high)
  const pct = Math.max(0, Math.min(1, rate))
  if (pct < 0.5) {
    const t = pct / 0.5
    return `color-mix(in oklch, oklch(0.74 0.13 190) ${(1 - t) * 100}%, oklch(0.8 0.14 80))`
  }
  const t = (pct - 0.5) / 0.5
  return `color-mix(in oklch, oklch(0.8 0.14 80) ${(1 - t) * 100}%, oklch(0.65 0.2 20))`
}

export function AttritionHeatmap({ data }: { data: Employee[] }) {
  const depts = [...new Set(data.map((e) => e.dept).filter(Boolean))].sort() as string[]

  const cell = (dept: string, band: string) => {
    const subset = data.filter((e) => e.dept === dept && ageBand(e.age) === band)
    if (subset.length === 0) return { rate: null as number | null, count: 0 }
    const left = subset.filter((e) => e.attrition === "Yes").length
    return { rate: left / subset.length, count: subset.length }
  }

  return (
    <Card className="animate-in">
      <CardHeader
        title="Attrition Heatmap — Department × Age Band"
        subtitle="Darker red cells flag the highest-risk workforce segments"
      />
      <div className="overflow-x-auto p-4">
        <table className="w-full border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left font-medium text-muted-foreground">Department</th>
              {AGE_BANDS.map((b) => (
                <th key={b} className="p-2 text-center font-medium text-muted-foreground">
                  {b}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {depts.map((dept) => (
              <tr key={dept}>
                <td className="whitespace-nowrap p-2 font-medium text-foreground">{dept}</td>
                {AGE_BANDS.map((band) => {
                  const { rate, count } = cell(dept, band)
                  return (
                    <td key={band} className="p-0">
                      <div
                        className="flex h-11 flex-col items-center justify-center rounded-md text-[11px] font-semibold"
                        style={{
                          background: rate === null ? "var(--muted)" : heatColor(rate),
                          color: rate === null ? "var(--muted-foreground)" : "oklch(0.16 0.014 250)",
                        }}
                        title={rate === null ? "No data" : `${count} employees`}
                      >
                        {rate === null ? "—" : `${(rate * 100).toFixed(0)}%`}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span>Low</span>
          <div
            className="h-2 flex-1 rounded-full"
            style={{
              background:
                "linear-gradient(to right, oklch(0.74 0.13 190), oklch(0.8 0.14 80), oklch(0.65 0.2 20))",
            }}
          />
          <span>High</span>
        </div>
      </div>
    </Card>
  )
}
