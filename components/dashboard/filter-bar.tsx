"use client"

import { RotateCcw, Filter } from "lucide-react"
import type { Employee, Filters } from "@/lib/types"
import { DEFAULT_FILTERS } from "@/lib/types"
import { distinct } from "@/lib/data"
import { Select } from "@/components/ui/primitives"

export function FilterBar({
  all,
  filters,
  onChange,
}: {
  all: Employee[]
  filters: Filters
  onChange: (f: Filters) => void
}) {
  const withAll = (arr: string[]) => ["All", ...arr]
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter style={{ width: 16, height: 16 }} className="text-primary" />
          Filters
        </div>
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <RotateCcw style={{ width: 13, height: 13 }} />
          Reset
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Select
          label="Department"
          value={filters.dept}
          onChange={(v) => set({ dept: v })}
          options={withAll(distinct(all, "dept"))}
        />
        <Select
          label="City"
          value={filters.city}
          onChange={(v) => set({ city: v })}
          options={withAll(distinct(all, "city"))}
        />
        <Select
          label="Work Mode"
          value={filters.workmode}
          onChange={(v) => set({ workmode: v })}
          options={withAll(distinct(all, "workmode"))}
        />
        <Select
          label="Gender"
          value={filters.gender}
          onChange={(v) => set({ gender: v })}
          options={withAll(distinct(all, "gender"))}
        />
        <Select
          label="Overtime"
          value={filters.overtime}
          onChange={(v) => set({ overtime: v })}
          options={withAll(distinct(all, "overtime"))}
        />
        <Select
          label="Age Band"
          value={filters.ageBand}
          onChange={(v) => set({ ageBand: v })}
          options={["All", "Under 30", "30-39", "40-49", "50+"]}
        />
      </div>
    </div>
  )
}
