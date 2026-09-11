"use client"

import { useState } from "react"
import { AlertCircle, Loader2, Database } from "lucide-react"
import type { Employee, Filters } from "@/lib/types"
import { DEFAULT_FILTERS } from "@/lib/types"
import { useEmployees } from "@/lib/data"
import { Sidebar, MobileNav, type ViewId } from "./sidebar"
import { UploadButton } from "./upload-button"
import { DashboardView } from "./dashboard/dashboard-view"
import { PredictionView } from "./prediction/prediction-view"
import { ModelView } from "./model/model-view"
import { ExplorerView } from "./explorer/explorer-view"
import { AboutView } from "./about/about-view"

const TITLES: Record<ViewId, { title: string; sub: string }> = {
  dashboard: { title: "Attrition Dashboard", sub: "Real-time workforce retention analytics" },
  prediction: { title: "Risk Predictor", sub: "Score individual employee attrition risk" },
  model: { title: "Model Performance", sub: "Evaluation metrics & feature importance" },
  explorer: { title: "Data Explorer", sub: "Browse and export the employee dataset" },
  about: { title: "About Attrition IQ", sub: "Methodology & platform overview" },
}

export function AppShell() {
  const [view, setView] = useState<ViewId>("dashboard")
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [uploaded, setUploaded] = useState<Employee[] | null>(null)

  const { employees: fetched, error, isLoading } = useEmployees()
  const employees = uploaded ?? fetched
  const meta = TITLES[view]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active={view} onChange={setView} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground text-balance">
                {meta.title}
              </h1>
              <p className="text-xs text-muted-foreground">{meta.sub}</p>
            </div>
            <div className="flex items-center gap-3">
              {uploaded ? (
                <span className="hidden items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary sm:flex">
                  <Database style={{ width: 13, height: 13 }} />
                  Custom dataset ({uploaded.length.toLocaleString()})
                </span>
              ) : null}
              <UploadButton onData={setUploaded} />
            </div>
          </div>
          <MobileNav active={view} onChange={setView} />
        </header>

        <main className="flex-1 p-4 md:p-6">
          {isLoading && !employees ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Loading workforce data…</p>
            </div>
          ) : error && !employees ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-danger">
              <AlertCircle className="h-6 w-6" />
              <p className="text-sm">Failed to load dataset. Try uploading a file instead.</p>
            </div>
          ) : employees ? (
            <div className="mx-auto max-w-[1400px]">
              {view === "dashboard" && (
                <DashboardView employees={employees} filters={filters} onFilters={setFilters} />
              )}
              {view === "prediction" && <PredictionView />}
              {view === "model" && <ModelView />}
              {view === "explorer" && <ExplorerView employees={employees} />}
              {view === "about" && <AboutView />}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
