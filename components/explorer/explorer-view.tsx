"use client"

import { useMemo, useState } from "react"
import { Search, ArrowUpDown, Download } from "lucide-react"
import type { Employee } from "@/lib/types"
import { Card } from "@/components/ui/primitives"
import { fmtMoney } from "@/lib/utils"
import { cn } from "@/lib/utils"

type SortKey = keyof Employee
const PAGE_SIZE = 25

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "dept", label: "Department" },
  { key: "title", label: "Title" },
  { key: "city", label: "City" },
  { key: "age", label: "Age", align: "right" },
  { key: "salary", label: "Salary", align: "right" },
  { key: "tenure", label: "Tenure", align: "right" },
  { key: "satisfaction", label: "Satisfaction", align: "right" },
  { key: "overtime", label: "Overtime" },
  { key: "workmode", label: "Work Mode" },
  { key: "attrition", label: "Attrition" },
]

export function ExplorerView({ employees }: { employees: Employee[] }) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("id")
  const [asc, setAsc] = useState(true)
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = employees
    if (q) {
      rows = rows.filter((e) =>
        [e.name, e.dept, e.title, e.city, e.id].some((v) =>
          String(v ?? "").toLowerCase().includes(q),
        ),
      )
    }
    const sorted = [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av === null) return 1
      if (bv === null) return -1
      if (typeof av === "number" && typeof bv === "number") return asc ? av - bv : bv - av
      return asc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return sorted
  }, [employees, query, sortKey, asc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages - 1)
  const pageRows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setAsc((v) => !v)
    else {
      setSortKey(k)
      setAsc(true)
    }
    setPage(0)
  }

  const exportCsv = () => {
    const header = COLUMNS.map((c) => c.label).join(",")
    const lines = filtered.map((e) =>
      COLUMNS.map((c) => `"${String(e[c.key] ?? "").replace(/"/g, '""')}"`).join(","),
    )
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "employees_filtered.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="relative">
          <Search
            style={{ width: 16, height: 16 }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Search name, department, city…"
            className="h-9 w-72 rounded-lg border border-input bg-muted pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {filtered.length.toLocaleString()} records
          </span>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Download style={{ width: 14, height: 14 }} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className={cn(
                    "cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground transition hover:text-foreground",
                    c.align === "right" && "text-right",
                  )}
                >
                  <span className={cn("inline-flex items-center gap-1", c.align === "right" && "flex-row-reverse")}>
                    {c.label}
                    <ArrowUpDown
                      style={{ width: 12, height: 12 }}
                      className={cn(sortKey === c.key ? "text-primary" : "opacity-40")}
                    />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((e, i) => (
              <tr
                key={e.id + i}
                className="border-t border-border transition hover:bg-muted/30"
              >
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {e.id}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-foreground">
                  {e.name}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{e.dept}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{e.title}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{e.city}</td>
                <td className="px-4 py-2.5 text-right font-mono">{e.age ?? "—"}</td>
                <td className="px-4 py-2.5 text-right font-mono">
                  {e.salary != null ? fmtMoney(e.salary) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono">
                  {e.tenure != null ? e.tenure.toFixed(1) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono">{e.satisfaction ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{e.overtime}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{e.workmode}</td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      e.attrition === "Yes"
                        ? "bg-danger/15 text-danger"
                        : "bg-success/15 text-success",
                    )}
                  >
                    {e.attrition ?? "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border p-4 text-sm">
        <span className="text-xs text-muted-foreground">
          Page {current + 1} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={current >= totalPages - 1}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
