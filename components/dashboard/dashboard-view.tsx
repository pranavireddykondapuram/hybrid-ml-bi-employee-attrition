"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"
import type { Employee, Filters } from "@/lib/types"
import { applyFilters, computeKpis } from "@/lib/data"
import { KpiCards } from "./kpi-cards"
import { FilterBar } from "./filter-bar"
import {
  AttritionByDept,
  AttritionByWorkmode,
  AttritionByAge,
  AttritionBySatisfaction,
  OvertimeImpact,
} from "./attrition-charts"
import { AttritionHeatmap } from "./heatmap"

const CityMap = dynamic(() => import("./city-map").then((m) => m.CityMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
})

export function DashboardView({
  employees,
  filters,
  onFilters,
}: {
  employees: Employee[]
  filters: Filters
  onFilters: (f: Filters) => void
}) {
  const filtered = useMemo(() => applyFilters(employees, filters), [employees, filters])
  const kpis = useMemo(() => computeKpis(filtered), [filtered])

  return (
    <div className="flex flex-col gap-4">
      <FilterBar all={employees} filters={filters} onChange={onFilters} />
      <KpiCards kpis={kpis} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AttritionByDept data={filtered} />
        <AttritionByAge data={filtered} />
        <AttritionBySatisfaction data={filtered} />
        <OvertimeImpact data={filtered} />
        <AttritionByWorkmode data={filtered} />
        <CityMap data={filtered} />
      </div>

      <AttritionHeatmap data={filtered} />
    </div>
  )
}
