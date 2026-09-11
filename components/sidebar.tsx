"use client"

import {
  LayoutDashboard,
  BrainCircuit,
  GaugeCircle,
  Table2,
  Info,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewId = "dashboard" | "prediction" | "model" | "explorer" | "about"

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard; hint: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, hint: "KPIs & trends" },
  { id: "prediction", label: "Risk Predictor", icon: BrainCircuit, hint: "ML scoring" },
  { id: "model", label: "Model Performance", icon: GaugeCircle, hint: "Metrics" },
  { id: "explorer", label: "Data Explorer", icon: Table2, hint: "Records" },
  { id: "about", label: "About", icon: Info, hint: "Methodology" },
]

export function Sidebar({
  active,
  onChange,
}: {
  active: ViewId
  onChange: (v: ViewId) => void
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 lg:flex">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">Attrition IQ</p>
          <p className="text-xs text-muted-foreground">Hybrid ML + BI</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-[11px] opacity-70">{item.hint}</span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Predictive workforce analytics for proactive retention.
        </p>
      </div>
    </aside>
  )
}

export function MobileNav({
  active,
  onChange,
}: {
  active: ViewId
  onChange: (v: ViewId) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border bg-card/50 px-2 py-2 lg:hidden">
      {NAV.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon style={{ width: 16, height: 16 }} />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
