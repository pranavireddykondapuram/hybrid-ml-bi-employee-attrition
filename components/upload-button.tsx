"use client"

import { useRef, useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import type { Employee } from "@/lib/types"

// Column-name aliases so uploaded Excel/CSV files map onto our Employee shape.
const ALIASES: Record<keyof Employee, string[]> = {
  id: ["id", "employeeid", "empid", "employee id"],
  name: ["name", "employeename", "fullname", "employee name"],
  gender: ["gender", "sex"],
  age: ["age", "age_clean"],
  dept: ["department", "dept"],
  title: ["jobtitle", "title", "designation", "job title"],
  city: ["city", "location", "workcity"],
  salary: ["annual salary", "salary", "annualsalary", "income"],
  marital: ["marital status", "maritalstatus", "marital"],
  education: ["educationlevel", "education", "education level"],
  perf: ["performancerating_clean", "performancerating", "performance", "performance rating"],
  attrition: ["attrition", "left", "churn"],
  tenure: ["yearsatcompany", "tenure", "years at company"],
  overtime: ["overtime", "over time"],
  training: ["traininghourslastyear", "training", "training hours"],
  workmode: ["work mode", "workmode", "worklocation"],
  satisfaction: ["satisfactionscore", "satisfaction", "satisfaction score"],
  promoted: ["everpromoted", "promoted", "ever promoted"],
}

const NUMERIC: (keyof Employee)[] = ["age", "salary", "perf", "tenure", "training", "satisfaction"]

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[_\s]+/g, " ")
}

export function UploadButton({ onData }: { onData: (rows: Employee[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const XLSX = await import("xlsx")
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null })
      if (!json.length) throw new Error("The file has no rows.")

      const headers = Object.keys(json[0])
      const headerMap = new Map<string, string>()
      for (const h of headers) headerMap.set(normalize(h), h)

      const resolve = (field: keyof Employee): string | null => {
        for (const alias of ALIASES[field]) {
          const found = headerMap.get(normalize(alias))
          if (found) return found
        }
        return null
      }
      const resolved = Object.fromEntries(
        (Object.keys(ALIASES) as (keyof Employee)[]).map((f) => [f, resolve(f)]),
      ) as Record<keyof Employee, string | null>

      const rows: Employee[] = json.map((r, i) => {
        const get = (f: keyof Employee) => {
          const col = resolved[f]
          const v = col ? r[col] : null
          if (v === null || v === undefined || v === "") return null
          if (NUMERIC.includes(f)) {
            const n = Number(String(v).replace(/[₹,$\s,]/g, ""))
            return Number.isNaN(n) ? null : n
          }
          return String(v)
        }
        return {
          id: (get("id") as string) ?? `EMP-${i + 1}`,
          name: (get("name") as string) ?? `Employee ${i + 1}`,
          gender: get("gender") as string | null,
          age: get("age") as number | null,
          dept: get("dept") as string | null,
          title: get("title") as string | null,
          city: get("city") as string | null,
          salary: get("salary") as number | null,
          marital: get("marital") as string | null,
          education: get("education") as string | null,
          perf: get("perf") as number | null,
          attrition: normalizeAttrition(get("attrition")),
          tenure: get("tenure") as number | null,
          overtime: normalizeYesNo(get("overtime")),
          training: get("training") as number | null,
          workmode: get("workmode") as string | null,
          satisfaction: get("satisfaction") as number | null,
          promoted: normalizeYesNo(get("promoted")),
        }
      })
      onData(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the file.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ""
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
      >
        {loading ? (
          <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
        ) : (
          <Upload style={{ width: 16, height: 16 }} />
        )}
        Upload dataset
      </button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  )
}

function normalizeAttrition(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).toLowerCase()
  if (["yes", "1", "true", "left"].includes(s)) return "Yes"
  if (["no", "0", "false", "stayed"].includes(s)) return "No"
  return String(v)
}

function normalizeYesNo(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).toLowerCase()
  if (["yes", "1", "true"].includes(s)) return "Yes"
  if (["no", "0", "false"].includes(s)) return "No"
  return String(v)
}
