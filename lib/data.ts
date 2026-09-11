import useSWR from "swr"
import type { Employee, RawDataset, Filters } from "./types"

export function rowsToEmployees(raw: RawDataset): Employee[] {
  const idx = Object.fromEntries(raw.columns.map((c, i) => [c, i]))
  return raw.rows.map((r) => ({
    id: r[idx.id] as string,
    name: r[idx.name] as string,
    gender: (r[idx.gender] as string) ?? null,
    age: (r[idx.age] as number) ?? null,
    dept: (r[idx.dept] as string) ?? null,
    title: (r[idx.title] as string) ?? null,
    city: (r[idx.city] as string) ?? null,
    salary: (r[idx.salary] as number) ?? null,
    marital: (r[idx.marital] as string) ?? null,
    education: (r[idx.education] as string) ?? null,
    perf: (r[idx.perf] as number) ?? null,
    attrition: (r[idx.attrition] as string) ?? null,
    tenure: (r[idx.tenure] as number) ?? null,
    overtime: (r[idx.overtime] as string) ?? null,
    training: (r[idx.training] as number) ?? null,
    workmode: (r[idx.workmode] as string) ?? null,
    satisfaction: (r[idx.satisfaction] as number) ?? null,
    promoted: (r[idx.promoted] as string) ?? null,
  }))
}

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((raw: RawDataset) => rowsToEmployees(raw))

export function useEmployees() {
  const { data, error, isLoading } = useSWR<Employee[]>("/data/dataset.json", fetcher, {
    revalidateOnFocus: false,
  })
  return { employees: data, error, isLoading }
}

export function ageBand(age: number | null): string {
  if (age === null) return "Unknown"
  if (age < 30) return "Under 30"
  if (age < 40) return "30-39"
  if (age < 50) return "40-49"
  return "50+"
}

export function applyFilters(employees: Employee[], f: Filters): Employee[] {
  return employees.filter((e) => {
    if (f.dept !== "All" && e.dept !== f.dept) return false
    if (f.city !== "All" && e.city !== f.city) return false
    if (f.workmode !== "All" && e.workmode !== f.workmode) return false
    if (f.gender !== "All" && e.gender !== f.gender) return false
    if (f.overtime !== "All" && e.overtime !== f.overtime) return false
    if (f.ageBand !== "All" && ageBand(e.age) !== f.ageBand) return false
    return true
  })
}

export function distinct(employees: Employee[], key: keyof Employee): string[] {
  const set = new Set<string>()
  for (const e of employees) {
    const v = e[key]
    if (v !== null && v !== undefined && v !== "") set.add(String(v))
  }
  return [...set].sort()
}

const isAttrition = (e: Employee) => e.attrition === "Yes"

export interface GroupStat {
  key: string
  total: number
  left: number
  rate: number
}

export function groupBy(
  employees: Employee[],
  accessor: (e: Employee) => string,
): GroupStat[] {
  const map = new Map<string, { total: number; left: number }>()
  for (const e of employees) {
    const k = accessor(e)
    if (!k) continue
    const cur = map.get(k) ?? { total: 0, left: 0 }
    cur.total += 1
    if (isAttrition(e)) cur.left += 1
    map.set(k, cur)
  }
  return [...map.entries()]
    .map(([key, v]) => ({
      key,
      total: v.total,
      left: v.left,
      rate: v.total ? v.left / v.total : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export interface Kpis {
  headcount: number
  attrition: number
  attritionRate: number
  avgSalary: number
  avgTenure: number
  avgSatisfaction: number
  avgAge: number
  overtimeShare: number
}

export function computeKpis(employees: Employee[]): Kpis {
  const headcount = employees.length
  const left = employees.filter(isAttrition).length
  const avg = (nums: (number | null)[]) => {
    const valid = nums.filter((n): n is number => n !== null && !Number.isNaN(n))
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
  }
  const overtimeYes = employees.filter((e) => e.overtime === "Yes").length
  return {
    headcount,
    attrition: left,
    attritionRate: headcount ? left / headcount : 0,
    avgSalary: avg(employees.map((e) => e.salary)),
    avgTenure: avg(employees.map((e) => e.tenure)),
    avgSatisfaction: avg(employees.map((e) => e.satisfaction)),
    avgAge: avg(employees.map((e) => e.age)),
    overtimeShare: headcount ? overtimeYes / headcount : 0,
  }
}
