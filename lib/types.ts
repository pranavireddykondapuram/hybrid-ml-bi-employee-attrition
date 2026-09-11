export interface Employee {
  id: string
  name: string
  gender: string | null
  age: number | null
  dept: string | null
  title: string | null
  city: string | null
  salary: number | null
  marital: string | null
  education: string | null
  perf: number | null
  attrition: string | null
  tenure: number | null
  overtime: string | null
  training: number | null
  workmode: string | null
  satisfaction: number | null
  promoted: string | null
}

export interface RawDataset {
  columns: string[]
  rows: (string | number | null)[][]
}

export interface Filters {
  dept: string
  city: string
  workmode: string
  gender: string
  overtime: string
  ageBand: string
}

export const DEFAULT_FILTERS: Filters = {
  dept: "All",
  city: "All",
  workmode: "All",
  gender: "All",
  overtime: "All",
  ageBand: "All",
}
